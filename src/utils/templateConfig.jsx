import templateConfig from "../config/templateConfig.json";

export const defaultParameters = templateConfig.defaultParameters;
export const fieldConfigs = templateConfig.fields;
export const templates = templateConfig.templates;
export const builtInTemplates = Object.entries(templates)
  .filter(([templateId, template]) => templateId !== "custom" && template.htmlFile)
  .map(([id, template]) => ({
    id,
    ...template,
  }));

export function getTemplateDefaults(templateId) {
  return {
    ...defaultParameters,
    ...(templates[templateId]?.defaults || {}),
  };
}

export function getEditableFields(templateId) {
  return templates[templateId]?.editableFields || [];
}
