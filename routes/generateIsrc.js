/**
 *
 *
 * 1. IN for india
 * 2. F for forevision
 * 3. 23 registrant code
 * 4. 24 year
 * 5. next digits are based on expected song counts of the year 00000
 *
 *
 * */

const generateIsrc = (startNum = 1) => {
  const currentYearLastTwoDigits = new Date()
    .getFullYear()
    .toString()
    .slice(-2);
  const numericPartStr = startNum.toString().padStart(5, "0");
  return `INF23${currentYearLastTwoDigits}${numericPartStr}`;
};

module.exports = generateIsrc;
