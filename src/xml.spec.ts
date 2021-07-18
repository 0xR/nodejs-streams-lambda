import { toXml } from './xml';

it('should convert to xml', async () => {
  var xml = toXml('user', {
    name: 'hello',
    address: {
      street: 'street',
      number: 123,
    },
  });
  expect(xml).toMatchInlineSnapshot(
    `"<user><name>hello</name><address><street>street</street><number>123</number></address></user>"`,
  );
});
