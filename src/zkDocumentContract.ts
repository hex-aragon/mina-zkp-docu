import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  PrivateKey,
  PublicKey,
  Bool,
} from 'o1js';

export const users = {
  Tom: PrivateKey.fromBase58(
    'EKFAdBGSSXrBbaCVqy4YjwWHoGEnsqYRQTqz227Eb5bzMx2bWu3F'
  ),
  Jay: PrivateKey.fromBase58(
    'EKEitxmNYYMCyumtKr8xi1yPpY3Bq6RZTEQsozu2gGf44cNxowmg'
  ),
};

export class ZkDocumentContract extends SmartContract {
  @state(Field) trustHash = State<Field>();
  @state(Field) trustPoint = State<Field>();
  @state(PublicKey) user1 = State<PublicKey>();
  @state(PublicKey) user2 = State<PublicKey>();
  @state(Bool) title = State<Bool>();
  @state(Bool) contents = State<Bool>();

  init() {
    super.init();
    this.user1.set(users['Tom'].toPublicKey());
    this.user2.set(users['Jay'].toPublicKey());
    this.trustPoint.set(Field(0));
  }

  @method async initState(
    saltOne: Field,
    saltTwo: Field,
    firstSecret: Field,
    secondSecret: Field
  ) {
    this.trustHash.set(
      Poseidon.hash([saltOne, saltTwo, firstSecret, secondSecret])
    );
  }

  @method async incrementTrustPoint(
    saltOne: Field,
    saltTwo: Field,
    secretOne: Field,
    secretTwo: Field
  ) {
    const x = this.trustHash.get();
    this.trustHash.requireEquals(x);

    Poseidon.hash([saltOne, saltTwo, secretOne, secretTwo]).assertEquals(x);
    this.trustHash.set(
      Poseidon.hash([saltOne, saltTwo, secretOne.add(1), secretTwo])
    );
    this.trustPoint.set(Field(1));
  }

  async getStatus() {
    const t = this.title.get();
    const c = this.contents.get();
    return { t, c };
  }

  @method async update(title_: Bool, contents_: Bool) {
    this.title.set(title_);
    this.contents.set(contents_);
    this.trustPoint.set(Field(2));
  }
}
