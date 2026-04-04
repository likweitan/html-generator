import Handlebars from "handlebars";

export function renderTemplate(templateContent, parameters) {
  const template = Handlebars.compile(templateContent, { noEscape: true });
  return template(parameters);
}
