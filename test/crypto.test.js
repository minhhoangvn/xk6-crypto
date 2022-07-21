/**
 * MIT License
 *
 * Copyright (c) 2021 Iván Szkiba
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export { options } from "./expect.js";
import { describe } from "./expect.js";
import { hkdf, pbkdf2, generateKeyPair, ecdh, rsaPublicEncryptWithBase64PublicKey, rsaEncryptOAEP} from "k6/x/crypto";

export default function () {
  describe("hkdf", (t) => {
    const key = hkdf("sha256", "top secret", null, null, 64);
    t.expect(key.byteLength).as("key length").toEqual(64);
  });

  describe("pbkdf2", (t) => {
    const key = pbkdf2("top secret", null, 10000, 48, "sha256");
    t.expect(key.byteLength).as("key length").toEqual(48);
  });

  describe("generateKeyPair", (t) => {
    const pair = generateKeyPair("ed25519");
    t.expect(pair.publicKey.byteLength).as("public key length").toEqual(32);
    t.expect(pair.privateKey.byteLength).as("private key length").toEqual(64);
  });

  describe("generateKeyPair with seed", (t) => {
    const pair = generateKeyPair("ed25519", pbkdf2("top secret", null, 10000, 32, "sha256"));
    t.expect(pair.publicKey.byteLength).as("public key length").toEqual(32);
    t.expect(pair.privateKey.byteLength).as("private key length").toEqual(64);
  });

  describe("ecdh", (t) => {
    const alice = generateKeyPair("ed25519");
    const bob = generateKeyPair("ed25519");

    const aliceShared = new Uint8Array(ecdh("ed25519", alice.privateKey, bob.publicKey));
    const bobShared = new Uint8Array(ecdh("ed25519", bob.privateKey, alice.publicKey));
    t.expect(aliceShared.every((val, i) => val == bobShared[i]))
      .as("shared secrets equals")
      .toBeTruthy();
  });

  describe("rsaPublicEncryptWithBase64PublicKey", (t) => {
    const data = rsaPublicEncryptWithBase64PublicKey("MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJo26jOpAMWZkXEQnyWWV54e5bkxBSH7OK+FbYUycxXG5NitcFkNv/QuEuSqwC8xy8rcUKaLOSwQpCz0o+l8vO8CAwEAAQ==", "YJGWOWQ4YMYTOTKYZC0ZODAWLWJKZTGTMDDMZTA4NJY0N2Y0")
    t.expect(data.length).as("public key length").toBeGreaterThan(32);
  });

  describe("rsaEncryptOAEP", (t) => {
    const data = rsaEncryptOAEP(
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwL8xETaqklh9+QzMG5YB3H/UFdvvUgmuGMTHE3+VvARes69+0EFrfZFF/eXESmK7IPwSCfWy8cOB7dsx47Fq6pT+8pomJmEb9hN+uJj18KAal3e/RMd+ojsi7PT0x7oUbrHkFQpTxLgNJqIj2W3B5pLVteoeOikW3gBo/gyh3mdFCSsmrqHy1TLpVo9tCUZlVbFK1ZOIsJ7jiO0cO+lJB99cXlk2poWLrASyaBdoOM1QchTWNDewVIjLrSbwGX6rnbjBFfOorw0kiwANyazLT5ta1pkNF4sl29JJWFJjE/X9nkxx1mH/y+z34TZvLUWO7qp9ZOvX5V+HTMpMl9teDwIDAQAB",
      JSON.stringify({
        "pin": "b1fc8496935a5a50e758bc3da1b779f87cda43c2703b527198c4f03483e0fab1",
        "salt": "711fb3a2-d25e-4235-9cc6-9641c5302e6f"
      }),
      "sha256")
    console.log(data);
    t.expect(data.length).as("public key length").toBeGreaterThan(32);
  });
}
