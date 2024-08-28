import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favourites } from "../target/types/favourites";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("favourites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Favourites as Program<Favourites>;
  const provider = anchor.AnchorProvider.env();
  const user = (provider.wallet as anchor.Wallet).payer;

  it("Is initialized!", async () => {
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    const balanceInSol = balance / 1e9;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSol);

    console.log("Balance in SOL", formattedBalance);

    const favouriteNumber = new anchor.BN(7);
    const favouriteColor = 'red';
    const favouriteThings = ['bike'];

    // Add your test here.
    const tx = await program.methods.initialize(new anchor.BN(7), 'red', favouriteThings).signers([user]).rpc();
    console.log("Your transaction signature", tx);

    const balanceAfter = await provider.connection.getBalance(provider.wallet.publicKey);
    const balanceInSolAfter = balanceAfter / 1e9;
    const formattedBalanceAfter = new Intl.NumberFormat().format(balanceInSolAfter);
    console.log("Balance in SOL", formattedBalanceAfter);

    const [favouritesAddress, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("favourites"), user.publicKey.toBuffer()], program.programId);

    const favouritesAccount = await program.account.favourites.fetch(favouritesAddress);

    console.log("Favourites account", favouritesAccount);


  });
});
