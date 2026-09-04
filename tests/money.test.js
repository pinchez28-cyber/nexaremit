// tests/money.test.js
//
// ISO 4217 minor-unit conversion (P1-3's core). Every supported send currency
// must round-trip major -> minor -> major exactly, and the fixed /100 and /1000
// assumptions that previously broke JPY and BHD must be gone.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  minorUnitsPerMajor,
  minorToMajor,
  majorToMinor,
} from "../src/lib/money.js";

test("minorUnitsPerMajor: two-decimal currencies return 100", () => {
  for (const code of ["USD", "EUR", "KES", "NGN", "GBP", "CAD", "MXN"]) {
    assert.equal(minorUnitsPerMajor(code), 100, `${code} should be /100`);
  }
});

test("minorUnitsPerMajor: zero-decimal currencies return 1", () => {
  for (const code of ["JPY", "KRW", "VND", "CLP", "ISK"]) {
    assert.equal(minorUnitsPerMajor(code), 1, `${code} should be /1`);
  }
});

test("minorUnitsPerMajor: three-decimal currencies return 1000", () => {
  for (const code of ["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]) {
    assert.equal(minorUnitsPerMajor(code), 1000, `${code} should be /1000`);
  }
});

test("minorUnitsPerMajor: unknown currency defaults to 100", () => {
  assert.equal(minorUnitsPerMajor("ZZZ"), 100);
  assert.equal(minorUnitsPerMajor(""), 100);
  assert.equal(minorUnitsPerMajor(undefined), 100);
});

test("majorToMinor/minorToMajor round-trip is exact for all send currencies", () => {
  const cases = [
    { code: "USD", major: 1234.56, minor: 123456 },
    { code: "EUR", major: 987.65, minor: 98765 },
    { code: "KES", major: 12345.67, minor: 1234567 },
    { code: "JPY", major: 12345, minor: 12345 },
    { code: "BHD", major: 123.456, minor: 123456 },
    { code: "GBP", major: 42.01, minor: 4201 },
    { code: "CAD", major: 1.0, minor: 100 },
    { code: "AUD", major: 0.01, minor: 1 },
    { code: "NZD", major: 3.5, minor: 350 },
    { code: "CHF", major: 88.88, minor: 8888 },
    { code: "SEK", major: 90.12, minor: 9012 },
    { code: "NOK", major: 100.0, minor: 10000 },
    { code: "DKK", major: 200.5, minor: 20050 },
    { code: "SGD", major: 300.99, minor: 30099 },
    { code: "AED", major: 400.55, minor: 40055 },
    { code: "SAR", major: 500.75, minor: 50075 },
  ];
  for (const { code, major, minor } of cases) {
    assert.equal(majorToMinor(major, code), minor, `${code} major->minor`);
    assert.equal(minorToMajor(minor, code), major, `${code} minor->major`);
    assert.equal(
      minorToMajor(majorToMinor(major, code), code),
      major,
      `${code} round-trip`
    );
    assert.equal(
      majorToMinor(minorToMajor(minor, code), code),
      minor,
      `${code} round-trip minor`
    );
  }
});

test("the exact audit bug: a JPY transfer converted with /100 undercharges by 100x", () => {
  // 12,345 JPY. Correct minor units: 12345. The old /100 math produced
  // 12,345,000 "cents" (100x too large) OR — for a minor sent as major — the
  // limit comparison used 123.45 instead of 12,345. Either way it is wrong.
  assert.equal(majorToMinor(12345, "JPY"), 12345);
  assert.equal(majorToMinor(12345, "JPY") / 100, 123.45); // what /100 math would wrongly claim
  // A daily limit of 2500 today correctly bites at 12345 minor (=12345 major).
  assert.equal(minorToMajor(12345, "JPY"), 12345);
});

test("minorToMajor returns 0 for non-finite input (never NaN, which defeats limits)", () => {
  assert.equal(minorToMajor("not-a-number", "USD"), 0);
  assert.equal(minorToMajor(NaN, "USD"), 0);
  assert.equal(minorToMajor(undefined, "USD"), 0);
  assert.equal(majorToMinor(Infinity, "USD"), 0);
  assert.equal(majorToMinor("abc", "USD"), 0);
});

test("zero-decimal currency round-trip through pricing minors", () => {
  // JPY quote: send 5000 yen major -> 5000 minor; no /100 anywhere.
  assert.equal(majorToMinor(5000, "JPY"), 5000);
  // BHD quote: 1.250 fils-major -> 1250 minor; not 125 (the /100 error).
  assert.equal(majorToMinor(1.25, "BHD"), 1250);
});