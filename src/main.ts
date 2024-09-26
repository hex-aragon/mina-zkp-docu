import { ZkDocumentContract } from './zkDocumentContract.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  CircuitString,
  Struct,
  Signature,
  Character,
} from 'o1js';

const useProof = false;

//test users
export const users = {
  Tom: PrivateKey.fromBase58(
    'EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F'
  ),
  Jay: PrivateKey.fromBase58(
    'EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg'
  ),
};

//local test
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;

const ContractorOneAccount = Local.testAccounts[1];
const ContractorOneKey = ContractorOneAccount.key;

const ContractorTwoAccount = Local.testAccounts[2];
const ContractorTwoKey = ContractorTwoAccount.key;

//salt for security
const saltOne = Field.random();
const saltTwo = Field.random();

//contract contents
const appointmentTitle = CircuitString.fromString(
  'Real estate lease agreements'
);

const appointmentContents = CircuitString.fromString(
  'Landlord and Tenant will pay rent on the 25th of each month. The term of this agreement is for one year.'
);

//offchain data
class Point extends Struct({
  x: Field,
  y: Field,
  a: CircuitString,
  b: CircuitString,
  c: Boolean,
  d: Boolean,
}) {
  static add(a: Point, b: Point) {
    return { x: a.x.add(b.x), y: a.y.add(b.y) };
  }

  static appointMent(a: Point, b: Point) {
    return {
      Title: b.a.toString(),
      Content: b.b.toString(),
      c: true,
      d: false,
    };
  }
}

const point1 = {
  x: Field(0),
  y: Field(0),
  a: CircuitString.fromString(''),
  b: CircuitString.fromString(''),
  c: true,
  d: true,
};

const point2 = {
  x: Field(1),
  y: Field(0),
  a: appointmentTitle,
  b: appointmentContents,
  c: true,
  d: true,
};

const pointSum = Point.add(point1, point2);
const contractContents = Point.appointMent(point1, point2);
//offchain data

//verify appointment
const char1 = Character.fromString('v');
const concatTitle = Character.toFields(char1).concat(
  CircuitString.toFields(appointmentTitle)
);
const concatContent = Character.toFields(char1).concat(
  CircuitString.toFields(appointmentContents)
);

const zkAppPrivateKey = PrivateKey.random();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const TomPriv = PrivateKey.fromBase58(
  'EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F'
);
const JayPriv = PrivateKey.fromBase58(
  'EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg'
);

const signatureTitle = Signature.create(TomPriv, concatTitle);
const signatureContent = Signature.create(JayPriv, concatContent);

const verifiedData1 = signatureTitle.verify(
  users['Tom'].toPublicKey(),
  concatTitle
);

const verifiedData2 = signatureContent.verify(
  users['Jay'].toPublicKey(),
  concatContent
);

const zkAppInstance = new ZkDocumentContract(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkAppInstance.deploy();
  await zkAppInstance.initState(saltOne, saltTwo, Field(0), Field(0));
});

await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

const txn1 = await Mina.transaction(ContractorOneAccount, async () => {
  await zkAppInstance.incrementTrustPoint(saltOne, saltTwo, Field(0), Field(0));
});
await txn1.prove();
await txn1.sign([ContractorOneKey]).send();

const txn2 = await Mina.transaction(ContractorOneAccount, async () => {
  await zkAppInstance.update(verifiedData1, verifiedData2);
});
await txn2.prove();
await txn2.sign([ContractorOneKey]).send();
