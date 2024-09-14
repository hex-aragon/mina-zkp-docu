import { sender } from 'o1js/dist/node/lib/mina/mina.js';
import { Square } from './Square.js';
import { Field, Mina, PrivateKey, AccountUpdate, Provable } from 'o1js';

//증명 설정 
const useProof = false;
//로컬 블록체인 
 const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
 //로컬 블록체인 인스턴스 설정 
 Mina.setActiveInstance(Local);

 Provable.log("Local",Local)

 Provable.log("Mina.setActiveInstance(Local)",Mina.setActiveInstance(Local))
 
 

 //zkapp 컨트랙트 배포자 
 const deployerAccount = Local.testAccounts[0];
 //zkapp 컨트랙트 키
 const deployerKey = deployerAccount.key;

 Provable.log("deployerAccount",deployerAccount)

 Provable.log("deployerKey",deployerKey)
 
 

 //로컬 센더 어카운트 
 const senderAccount = Local.testAccounts[1];
 //로컬 센더 프라이빗 키 
 const senderKey = senderAccount.key;

 Provable.log("senderAccount",senderAccount)

 Provable.log("senderKey",senderKey)
 
 
 // ----------------------------------------------------
// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
//랜덤 프라이빗 키 생성
const zkAppPrivateKey = PrivateKey.random();
//랜덤 프라이빗키로 생성한 어카운트 어드레스 
const zkAppAddress = zkAppPrivateKey.toPublicKey();

Provable.log("zkAppPrivateKey",zkAppPrivateKey)
Provable.log("zkAppAddress",zkAppAddress)

//create an instance of Square - and deploy it to zkAppAddress 
//zk App 인스턴스 생성 
const zkAppInstance = new  Square(zkAppAddress);
Provable.log("zkAppInstance",zkAppInstance)

//미나 디플로이 트랜잭션 설정 
const deployTxn = await Mina.transaction(deployerAccount, async()=> {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
})
Provable.log("deployTxn",deployTxn)


//미나 디플로이 트랜잭션 사인
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

//zkApp 인스턴스 숫자 가져오기 
const num0 = zkAppInstance.num.get();
console.log('state after init:', num0.toString());

//zkApp 트랜잭션 설정 ?? 컨트랙트 필드를  9로 업데이트 ?
const txn1 = await Mina.transaction(senderAccount, async () => {
    //zkAppInstance의 update 함수 호출 
    //필드를 9로 설정 
    await zkAppInstance.update(Field(9));
})
Provable.log("tx1",txn1)

const proveTest = await txn1.prove();
Provable.log("proveTest",proveTest);


const txn1SignTest = await txn1.sign([senderKey]).send();

Provable.log("txn1SignTest",txn1SignTest);

const num1 = zkAppInstance.num.get();
Provable.log("num1",num1);

console.log('state after txn1:', num1.toString());
// Provable.log("txn1SignTest",txn1SignTest);

const txn2 = await Mina.transaction(senderAccount, async () => {
    //zkAppInstance의 update 함수 호출 
    //필드를 9로 설정 
    await zkAppInstance.update(Field(81));
})
Provable.log("txn2",txn2);

const proveTest2 = await txn2.prove();
Provable.log("proveTest2",proveTest2);

const txn2SignTest2 = await txn2.sign([senderKey]).send();
Provable.log("txn2SignTest2",txn2SignTest2);

const num2 = zkAppInstance.num.get();
Provable.log("num2",num2);