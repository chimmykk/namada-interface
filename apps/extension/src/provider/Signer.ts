import {
  Account,
  Anoma,
  AccountMsgValue,
  AccountMsgSchema,
  DerivedAccount,
  IbcTransferMsgSchema,
  IbcTransferMsgValue,
  IbcTransferProps,
  InitAccountProps,
  Message,
  SignedTx,
  Signer as ISigner,
  TransferMsgValue,
  TransferMsgSchema,
  TransactionMsgValue,
  TransactionMsgSchema,
  TransferProps,
  TxProps,
} from "@anoma/types";

export class Signer implements ISigner {
  constructor(
    protected readonly chainId: string,
    private readonly _anoma: Anoma
  ) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._anoma.accounts(this.chainId))?.map((account) => ({
      alias: account.alias,
      address: account.address,
    }));
  }

  /**
   * Sign encoded transaction message, returning Tx hash and bytes
   */
  public async signTx(
    signer: string,
    txProps: TxProps,
    txData: Uint8Array
  ): Promise<SignedTx | undefined> {
    // TODO: Implement this._anoma.signTx(signer, txProps, encoded)
    const txMsg = new Message<TransactionMsgValue>();
    const txMsgValue = new TransactionMsgValue(txProps);
    const txMsgEncoded = txMsg.encode(TransactionMsgSchema, txMsgValue);

    return await this._anoma.signTx({ signer, txMsg: txMsgEncoded, txData });
  }

  /**
   * Encode a Transfer message
   */
  public async encodeTransfer(
    args: TransferProps
  ): Promise<Uint8Array | undefined> {
    const { source, target, token, amount } = args;
    const transferMsgValue = new TransferMsgValue({
      source,
      target,
      token,
      amount,
    });
    const transferMessage = new Message<TransferMsgValue>();
    const encodedTransfer = transferMessage.encode(
      TransferMsgSchema,
      transferMsgValue
    );

    if (encodedTransfer) {
      return await this._anoma.encodeTransfer(encodedTransfer);
    }
  }

  /**
   * Encode an IbcTransfer message
   */
  public async encodeIbcTransfer(
    args: IbcTransferProps
  ): Promise<Uint8Array | undefined> {
    const { sourcePort, sourceChannel, token, sender, receiver, amount } = args;
    const ibcTransferMsgValue = new IbcTransferMsgValue({
      sourcePort,
      sourceChannel,
      token,
      sender,
      receiver,
      amount,
    });
    const ibcTransferMessage = new Message<IbcTransferMsgValue>();
    // TODO: call this._anoma.getIbcTransfer();
    return ibcTransferMessage.encode(IbcTransferMsgSchema, ibcTransferMsgValue);
  }

  /**
   * Encode an InitAccount message
   */
  public async encodeInitAccount(
    signer: string,
    args: InitAccountProps
  ): Promise<Uint8Array> {
    console.log({ signer });
    const { vpCode } = args;
    const accountMsgValue = new AccountMsgValue({
      vpCode,
    });
    const accountMessage = new Message<AccountMsgValue>();
    // TODO: Init-Account requires a secret when creating InitAccount struct.
    // Look up secret for signer in storage:
    // Implement `this._anoma.initAccount(signer, encoded)`
    return accountMessage.encode(AccountMsgSchema, accountMsgValue);
  }
}