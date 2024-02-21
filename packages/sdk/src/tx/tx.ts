import { Query as QueryWasm, Sdk as SdkWasm, TxType } from "@namada/shared";
import { Message, TransferMsgValue, TxMsgValue } from "@namada/types";
import { TransferProps, TxProps } from "types";
import { EncodedTx, SignedTx } from "./types";

export class Tx {
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) { }

  /**
   * Build transfer
   *
   * @param {TxProps} txProps
   * @param {TransferProps} transferProps
   * @param {string} gasPayer
   *
   * @return {Uint8Array}
   */
  async buildTransfer(
    txProps: TxProps,
    transferProps: TransferProps,
    gasPayer: string
  ): Promise<EncodedTx> {
    const txMsg = new Message<TxMsgValue>();
    const transferMsg = new Message<TransferMsgValue>();

    const encodedTxMsg = txMsg.encode(new TxMsgValue(txProps));
    const encodedTransferMsg = transferMsg.encode(
      new TransferMsgValue(transferProps)
    );
    const tx = await this.sdk.build_tx(
      TxType.Transfer,
      encodedTxMsg,
      encodedTransferMsg,
      gasPayer
    );

    return new EncodedTx(encodedTxMsg, tx);
  }

  /**
   * Sign tx
   *
   * @param {EncodedTx} encodedTx
   * @param {string} signingKey
   *
   * @return {EncodedTx}
   */
  async signTx(encodedTx: EncodedTx, signingKey: string): Promise<SignedTx> {
    const { tx, txMsg } = encodedTx;
    const signedTx = await this.sdk.sign_tx(tx, txMsg, signingKey);

    return new SignedTx(txMsg, signedTx);
  }
}
