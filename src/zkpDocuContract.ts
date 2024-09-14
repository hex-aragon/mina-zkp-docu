import { sender } from 'o1js/dist/node/lib/mina/mina.js';
import { DocuContract } from './zkdocument.js';
import {
  Mina,
  PrivateKey,
  AccountUpdate,
  Character,
  CircuitString,
} from 'o1js';

//증명 설정
const useProof = false;
//로컬 블록체인
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
//로컬 블록체인 인스턴스 설정
Mina.setActiveInstance(Local);

//zkapp 컨트랙트 배포자
const deployerAccount = Local.testAccounts[0];
//zkapp 컨트랙트 키
const deployerKey = deployerAccount.key;

//로컬 센더 어카운트
const senderAccount = Local.testAccounts[1];
//로컬 센더 프라이빗 키
const senderKey = senderAccount.key;
// ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
//랜덤 프라이빗 키 생성
const zkAppPrivateKey = PrivateKey.random();
//랜덤 프라이빗키로 생성한 어카운트 어드레스
const zkAppAddress = zkAppPrivateKey.toPublicKey();

//create an instance of Square - and deploy it to zkAppAddress
//zk App 인스턴스 생성
const zkAppInstance = new DocuContract(zkAppAddress);
console.log('zkAppInstance', zkAppInstance);

//미나 디플로이 트랜잭션 설정
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  await zkAppInstance.deploy();
});
console.log('deployTxn', deployTxn);
//미나 디플로이 트랜잭션 사인
const test = await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

console.log('test', test);
//zkApp 인스턴스 숫자 가져오기
// const contractorOne = zkAppInstance.contractorOne.get();
// const contractorTwo = zkAppInstance.contractorTwo.get();
// const contractDetail = zkAppInstance.contractDetail.get();

const conOne = Character.fromString('b');
const conTwo = Character.fromString('a');
const conDetail = Character.fromString('c.');

console.log('conOne', conOne);
console.log('conTwo', conTwo);
console.log('conDetail', conDetail);

const txn1 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.update(conOne, conTwo, conDetail);
});

const proveTest = await txn1.prove();

const txn1SignTest = await txn1.sign([senderKey]).send();

// const contractorOne1 = zkAppInstance.contractorOne.get();
// const contractorTwo1 = zkAppInstance.contractorTwo.get();
// const contractDetail1 = zkAppInstance.contractDetail.get();
