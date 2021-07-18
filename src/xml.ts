import xml2js from 'xml2js';

var builder = new xml2js.Builder({
  headless: true,
  renderOpts: {
    pretty: false,
  },
});

export function toXml(elementName: string, data: unknown) {
  return builder.buildObject({ [elementName]: data });
}
