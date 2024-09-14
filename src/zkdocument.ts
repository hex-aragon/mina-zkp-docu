import {
  CircuitString,
  State,
  SmartContract,
  state,
  method,
  Mina,
  PrivateKey,
  Field,
  Character,
} from 'o1js';
import * as assert from 'assert/strict';

// circuit which tests a couple of string features
export class DocuContract extends SmartContract {
  @state(Character) user1 = State<Character>();
  @state(Character) user2 = State<Character>();
  @state(Character) contentS = State<Character>();

  init() {
    super.init();
    this.user1.set(Character.fromString(''));
    this.user2.set(Character.fromString(''));
    this.contentS.set(Character.fromString(''));
  }

  @method async checkString(s: CircuitString) {
    let sWithExclamation = s.append(CircuitString.fromString('!'));
    sWithExclamation
      .equals(CircuitString.fromString('bob!'))
      .or(sWithExclamation.equals(CircuitString.fromString('alice!')))
      .assertTrue();
  }

  @method async update(
    conOne: Character,
    conTwo: Character,
    conDetail: Character
  ) {
    this.user1.set(conOne);
    this.user2.set(conTwo);
    this.contentS.set(conDetail);
  }

  async get() {
    return {
      user1: this.user1,
      user2: this.user2,
      contentS: this.contentS,
    };
  }
}

let address = PrivateKey.random().toPublicKey();

console.log('compile...');
await DocuContract.compile();
// should work

console.log('prove...');
let tx = await Mina.transaction(() =>
  new DocuContract(address).checkString(CircuitString.fromString('bob'))
);

await tx.prove();
console.log('test 1 - ok');
// should work

tx = await Mina.transaction(() =>
  new DocuContract(address).checkString(CircuitString.fromString('alice'))
);

await tx.prove();
console.log('test 2 - ok');
console.log('tx', tx);

let tx2 = await Mina.transaction(() =>
  new DocuContract(address).update(
    Character.fromString('bob'),
    Character.fromString('alice'),
    Character.fromString('BOB and ALICE have a real estate contract.')
  )
);
await tx2.prove();
console.log('test 3 - ok');
console.log('tx2', tx2);

const result = new DocuContract(address).get();
console.log('test 4 - ok');
console.log('result', result);
