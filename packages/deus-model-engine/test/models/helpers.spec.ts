import helpers = require('../../helpers/model-helper');

describe('Helpers: ', () => {
  it('Predicates check', function () {
    expect(helpers.checkValue('3', '>1')).toBe(true);
    expect(helpers.checkValue('1', '<2')).toBe(true);
    expect(helpers.checkValue('9', '9')).toBe(true);

    expect(helpers.checkValue('12', '<3')).toBe(false);
    expect(helpers.checkValue('42', '43')).toBe(false);
    expect(helpers.checkValue('56', '32-46')).toBe(false);
    expect(helpers.checkValue('38', '32-46')).toBe(true);
    expect(helpers.checkValue('0', '>1')).toBe(false);
    expect(helpers.checkValue('50', '0-100')).toBe(true);
    expect(helpers.checkValue('-1', '>1')).toBe(false);
    expect(helpers.checkValue('blag', '>1')).toBe(false);
    expect(helpers.checkValue('10', '>0')).toBe(true);
    expect(helpers.checkValue('0', '0')).toBe(true);
  });
});
