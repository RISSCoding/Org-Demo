import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ipFromHeaders, rateLimitKey } from "@/lib/rate-limit-core";

const h = (o: Record<string, string>) => new Headers(o);

describe("ipFromHeaders", () => {
  it("memakai x-real-ip bila ada", () => {
    assert.equal(ipFromHeaders(h({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" })), "1.2.3.4");
  });
  it("memakai entri pertama x-forwarded-for", () => {
    assert.equal(ipFromHeaders(h({ "x-forwarded-for": " 5.6.7.8 , 10.0.0.1" })), "5.6.7.8");
  });
  it("'unknown' bila tidak ada header", () => {
    assert.equal(ipFromHeaders(h({})), "unknown");
  });
});

describe("rateLimitKey", () => {
  it("deterministik dan berbeda untuk masukan berbeda", () => {
    assert.equal(rateLimitKey("login:ip:1.2.3.4"), rateLimitKey("login:ip:1.2.3.4"));
    assert.notEqual(rateLimitKey("login:ip:1.2.3.4"), rateLimitKey("login:ip:1.2.3.5"));
  });
  it("tidak memuat IP/NPM mentah (aspirasi anonim tidak boleh bisa dilacak dari database)", () => {
    const k = rateLimitKey("feedback:ip:203.0.113.7");
    assert.match(k, /^[a-f0-9]{64}$/);
    assert.ok(!k.includes("203"));
  });
});
