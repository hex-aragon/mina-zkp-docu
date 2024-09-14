import { Signature, PrivateKey, CircuitString, UInt32,UInt64,Bool,Int64, Field,SmartContract, Character,state, State, method } from 'o1js';

const num1 = UInt32.from(40);
const num2 = UInt64.from(40);

const num1EqualsNum2: Bool = num1.toUInt64().equals(num2);

console.log(`num1 === num2: ${num1EqualsNum2.toString()}`);
console.log(`Fields in num1: ${num1.toFields().length}`);

// --------------------------------------

const signedNum1 = Int64.from(-3);
const signedNum2 = Int64.from(45);

const signedNumSum = signedNum1.add(signedNum2);

console.log(`signedNum1 + signedNum2: ${signedNumSum}`);
console.log(`Fields in signedNum1: ${signedNum1.toFields().length}`);

// --------------------------------------

const char1 = Character.fromString('c');
const char2 = Character.fromString('d');
const char1EqualsChar2: Bool = char1.toField().equals(char2.toField());

console.log(`char1: ${char1}`);
console.log(`char1 === char2: ${char1EqualsChar2.toString()}`);
console.log(`Fields in char1: ${Character.toFields(char1).length}`);


const str1 = CircuitString.fromString('abc..xyz');
console.log(`str1: ${str1}`);
console.log(`Fields in str1: ${CircuitString.toFields(str1).length}`);

// --------------------------------------

const zkAppPrivateKey = PrivateKey.random();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();

const data1 = Character.toFields(char2).concat(signedNumSum.toFields());
const data2 = Character.toFields(char1).concat(CircuitString.toFields(str1));

const signature = Signature.create(zkAppPrivateKey, data2);

const verifiedData1 = signature.verify(zkAppPublicKey, data1).toString();
const verifiedData2 = signature.verify(zkAppPublicKey, data2).toString();

console.log(`private key: ${zkAppPrivateKey.toBase58()}`);
console.log(`public key: ${zkAppPublicKey.toBase58()}`);
console.log(`Fields in private key: ${zkAppPrivateKey.toFields().length}`);
console.log(`Fields in public key: ${zkAppPublicKey.toFields().length}`);

console.log(`signature verified for data1: ${verifiedData1}`);
console.log(`signature verified for data2: ${verifiedData2}`);

console.log(`Fields in signature: ${signature.toFields().length}`);