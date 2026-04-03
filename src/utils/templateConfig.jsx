import templateConfig from "../config/templateConfig.json";

export const defaultParameters = templateConfig.defaultParameters;
export const fieldConfigs = templateConfig.fields;
export const templates = templateConfig.templates;

export function getTemplateDefaults(templateId) {
  return {
    ...defaultParameters,
    ...(templates[templateId]?.defaults || {}),
  };
}

export function getEditableFields(templateId) {
  return templates[templateId]?.editableFields || [];
}
