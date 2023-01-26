use std::str::FromStr;

use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ledger::{
        args::{self, SdkTypes},
        tx::submit_bond,
        wallet::{Alias, ConfirmationResponse, Store, StoredKeypair, Wallet, WalletUtils},
    },
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
        token,
        transaction::GasLimit,
    },
};
use wasm_bindgen::prelude::*;

use crate::{rpc_client::HttpClient, utils::console_log_any};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct TransactionMsg {
    token: String,
    fee_amount: u64,
    gas_limit: u64,
    tx_code: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct BondMsg {
    source: String,
    validator: String,
    amount: u64,
    tx_code: Vec<u8>,
}

const STORAGE_PATH: &str = "";

pub struct WebWallet {}

impl WalletUtils for WebWallet {
    type Storage = std::string::String;

    fn read_and_confirm_pwd(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }

    fn read_password(_prompt_msg: &str) -> String {
        todo!()
    }

    fn read_alias(_prompt_msg: &str) -> String {
        todo!()
    }

    fn show_overwrite_confirmation(_alias: &Alias, _alias_for: &str) -> ConfirmationResponse {
        ConfirmationResponse::Replace
    }

    fn new_password_prompt(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }
}

#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<WebWallet>,
}

#[wasm_bindgen]
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        console_error_panic_hook::set_once();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(STORAGE_PATH.to_owned(), Store::default()),
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        self.wallet.store().encode()
    }

    pub fn decode(mut self, data: Vec<u8>) {
        let store = Store::decode(data).expect("TODO");
        self.wallet = Wallet::new(STORAGE_PATH.to_owned(), store);
    }

    pub fn add_keys(&mut self, private_key: &str, alias: Option<String>) {
        let sk = key::ed25519::SecretKey::from_str(private_key)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
            .expect("FIX ME");
        let sk = SecretKey::Ed25519(sk);

        let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
        // What with pw?
        let (keypair_to_store, _raw_keypair) = StoredKeypair::new(sk, None);
        let address = Address::Implicit(ImplicitAddress(pkh.clone()));
        let alias: Alias = alias.unwrap_or_else(|| pkh.clone().into()).into();
        if self
            .wallet
            .store_mut()
            .insert_keypair::<WebWallet>(alias.clone(), keypair_to_store, pkh)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
        if self
            .wallet
            .store_mut()
            .insert_address::<WebWallet>(alias.clone(), address)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
    }

    pub async fn submit_bond(&mut self, bond_msg: &[u8], tx_msg: &[u8]) -> Result<(), JsError> {
        console_log_any(&"Hello1");
        let tx_msg = TransactionMsg::try_from_slice(tx_msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))
            .expect("TODO");
        let TransactionMsg {
            token,
            fee_amount,
            gas_limit,
            tx_code,
        } = tx_msg;

        let bond_msg = BondMsg::try_from_slice(bond_msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))
            .expect("TODO");

        let BondMsg {
            source,
            validator,
            amount,
            tx_code: bond_tx_code,
        } = bond_msg;

        let source = Address::from_str(&source).expect("Address from string should not fail");
        let validator = Address::from_str(&validator).expect("Address from string should not fail");
        let amount = token::Amount::from(amount);
        let token = Address::from_str(&token).expect("Address from string should not fail");
        let fee_amount = token::Amount::from(fee_amount);

        let tx: args::Tx<SdkTypes> = args::Tx {
            dry_run: false,
            force: false,
            broadcast_only: false,
            ledger_address: (),
            initialized_account_alias: None,
            fee_amount,
            fee_token: token.clone(),
            gas_limit: GasLimit::from(gas_limit),
            signing_key: None,
            signer: Some(source.clone()),
            tx_code_path: tx_code,
        };

        let args = args::Bond {
            tx,
            validator,
            amount,
            source: Some(source),
            native_token: token,
            tx_code_path: bond_tx_code,
        };

        console_log_any(&"Hello4");

        submit_bond(&self.client, &mut self.wallet, args)
            .await
            .map_err(|e| JsError::from(e))
    }
}
