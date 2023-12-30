<template>
  <div class="generic-edit-form f-col light">
    <template v-for="(attr, index) in attributes">
      <slot :name="attr.name" :attr="attr">
        <component
          :key="attr.name"
          ref="widget"
          :is="widgets[index].component"
          :initial="initial && initial[attr.name]"
          :label="attr.alias || attr.name"
          :status.sync="statuses[attr.name]"
          v-model="fields[attr.name]"
          v-bind="widgets[index].props"
        />
      </slot>
    </template>
  </div>
</template>

<script lang="js">
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'
// import NumberField from './NumberField.vue'
import TextField from './TextField.vue'
import MediaFileField from './MediaFileField.vue'
import RelationReferenceField from './RelationReferenceField.vue'
import { getFileService, mediaUrl } from '@/components/GenericInfopanel.vue'

function isIntegerString (strValue) {
  return /^-?\d+$/.test(strValue)
}
function toInteger (v) {
  return isIntegerString(v) ? parseInt(v) : v
}
function toNumber (v) {
  return !isNaN(v) ? parseFloat(v) : v
}
function isTrueValue (v) {
  return v === true || v == 1 || v?.toLowerCase?.() === 'true'
}


function layersList (node) {
  return node.layers ? [].concat(...node.layers.map(layersList)) : [node]
}

export default {
    props: {
        layer: Object,
        fields: Object,
        initial: Object,
        project: Object,
        feature: Object,
        attributeKeys: Array,
    },
    data() {
        return {
            statuses: {}
        };
    },
    computed: {
        layersList() {
            return layersList(this.project);
        },
        attributes() {
            const { attributes } = this.layer;
            if (this.attributeKeys && this.attributeKeys !== this.layer.info_panel_fields) {
                const attrsMap = keyBy(attributes, 'name');
                return this.attributeKeys.map(name => attrsMap[name]);
            }
            return attributes;
        },
        tr() {
            return {
                NotValidNumber: this.$gettext('Not valid number'),
                NotValidInteger: this.$gettext('Not valid integer number')
            };
        },
        integerValidator() {
            return v => v && !isIntegerString(v) ? this.tr.NotValidInteger : '';
        },
        numberValidator() {
            return v => v && isNaN(v) ? this.tr.NotValidNumber : '';
        },
        relations() {
            const relations = {}
            const layerName = this.layer.name;
            for (var i = 0; i < this.layersList.length; i++) {
                const layer = this.layersList[i];
                const relation = layer.relations?.find(relation => relation.referencing_layer.name === layerName);
                if (relation) {
                    for (var fieldIndex = 0; fieldIndex < relation.referencing_fields.length; fieldIndex++) {
                        const fieldName = relation.referencing_fields[fieldIndex]
                        relations[fieldName] = { referencedLayer: layer, relation }
                    }
                }
            }
            return relations
        },
        widgets() {
            return this.attributes.map(attr => {
                const disabled = attr.constrains?.includes('readonly');
                const type = attr.type.split('(')[0]?.toLowerCase();
                if (attr.widget === 'Hidden') {
                    return {};
                }
                if (attr.widget === 'Autofill') {
                    return {};
                }
                if (attr.widget === 'RelationReference') {
                    const relation = this.relations[attr.name]
                    if (relation) {
                        return {
                            component: RelationReferenceField,
                            props: {
                                attr,
                                relation: relation.relation,
                                referencedLayer: relation.referencedLayer,
                                options: attr.config,
                                disabled,
                                validator: attr.constrains?.includes('not_null') ? v => (!v ? this.$gettext('Required') : '') : null
                            }
                        };
                    }
                }
                else if (attr.widget === 'MediaImage' || attr.widget === 'MediaFile') {
                    const service = getFileService(attr, this.project.storage)
                    const { base: uploadUrl } = mediaUrl(this.project.name, this.layer, attr)
                    const { base: url, location } = mediaUrl(this.project.name, this.layer, attr, service)
                    return {
                        component: MediaFileField,
                        props: {
                            url,
                            uploadUrl,
                            location,
                            filename: attr.config?.filename || '<random>',
                            options: attr.config,
                            disabled,
                            allowTuning: service?.type !== 's3',
                            service,
                            validator: attr.constrains?.includes('not_null') ? v => (!v ? this.$gettext('Required') : '') : null
                        }
                    };
                }
                if (type === 'bool') {
                    return { component: 'v-checkbox', props: { disabled } };
                }
                if (type === 'date') {
                    return {
                        component: 'v-date-field',
                        props: {
                            disabled,
                            placeholder: attr.config?.display_format,
                            displayFormat: attr.config?.display_format,
                            valueFormat: attr.config?.field_format || 'yyyy-MM-dd'
                        }
                    };
                }
                if (type === 'integer' || type === 'double' || type === 'int' || type === 'float') {
                    const integerType = type === 'integer' || type === 'int';
                    return {
                        component: TextField,
                        props: {
                            type: 'number',
                            validator: integerType ? this.integerValidator : this.numberValidator,
                            transform: integerType ? toInteger : toNumber,
                            disabled
                        }
                    };
                    // return {
                    //   component: NumberField,
                    //   props: {
                    //     integer: type === 'integer',
                    //     disabled
                    //   }
                    // }
                }
                return {
                    component: TextField,
                    props: { disabled, multiline: isTrueValue(attr.config?.IsMultiline), rows: 3 }
                };
            });
        },
        status() {
            return Object.values(this.statuses).some(s => s === 'error') ? 'error' : 'ok';
        },
    },
    watch: {
        fields: {
            immediate: true,
            handler(fields) {
                this.statuses = mapValues(fields, () => null);
            }
        },
        status(val) {
            this.$emit('update:status', val);
        }
    },
    methods: {
        async beforeFeatureUpdated(f) {
            await Promise.all(this.$refs.widget.map(w => w.beforeFeatureUpdated?.(f)));
        },
        async afterFeatureUpdated(f) {
            await Promise.all(this.$refs.widget.map(w => w.afterFeatureUpdated?.(f)));
        },
        async beforeFeatureDeleted(f) {
            await Promise.all(this.$refs.widget.map(w => w.beforeFeatureDeleted?.(f)));
        },
        async afterFeatureDeleted(f) {
            await Promise.all(this.$refs.widget.map(w => w.afterFeatureDeleted?.(f)));
        }
    },
}
</script>

<style lang="scss" scoped>
.generic-edit-form {
  background-color: #f3f3f3;
}
</style>
