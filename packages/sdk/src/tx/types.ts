import { BuiltTx } from "@namada/shared/src";

/**
 * Wrap results of tx building along with TxMsg
 */
export class EncodedTx {
  constructor(
    // Serialized TxMsg
    public readonly txMsg: Uint8Array,
    // Built Tx
    public readonly tx: BuiltTx
  ) { }
}

/**
 * Wrap results of tx signing to simplify passing between Sdk functions
 */
export class SignedTx {
  constructor(
    // Serialized TxMsg
    public readonly txMsg: Uint8Array,
    // Built Tx
    public readonly tx: Uint8Array
  ) { }
}
