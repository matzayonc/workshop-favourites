use anchor_lang::prelude::*;

// Anchor uses the first 8 bytes of the account data to store a discriminator
// to check if the account is of the expected type.
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

// Declare the ID of the program (has to correspond with the public key from the `target` directory)
declare_id!("7eLAo756veqmTo4192BLmjTW3pfeZMQYjis1zU6SLX64");

// The smart contract is declared by the `#[program]` attribute.
#[program]
pub mod favourites {
    use super::*;

    pub fn create(
        // Context has all the needed blockchain information inside.
        // The generic parameter `Initialize` is the struct containing the accounts
        // needed for this instruction.
        ctx: Context<Create>,
        // Other functions params.
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        // Print a message to the `program_logs` file in the `.anchor` directory.
        msg!("Greetings from {}", ctx.program_id);

        // Load the user's public key from the accounts struct.
        let user_public_key = ctx.accounts.user.key();
        msg!("User {user_public_key}'s favorite number is {number}, favorite color is: {color}",);
        msg!("User's hobbies are: {:?}", hobbies);

        // Prepare the data to be stored in the account.
        let favourites = Favourites {
            number,
            color,
            hobbies,
        };

        // Set the account data with the provided values.
        // Access the `favourites` account from the accounts struct.
        // And we set to the value of type `Favourites` with the provided values.
        ctx.accounts.favourites.set_inner(favourites);

        // Return the success result.
        Ok(())
    }
}

// We define the `Create` struct that will contain the accounts needed for the instruction.
#[derive(Accounts)]
pub struct Create<'info> {
    // The first `Signer` account is the user that will pay for the transaction (payer).
    // It it mutable because as it will decrease the user's balance.
    #[account(mut)]
    // We define the `user` account that will sign the transaction.
    pub user: Signer<'info>,

    // PDA account that will store the user's favourites (user's data).
    #[account(
        // Init, because we are creating the account (using it for the first time).
        init, 
        // The payer is the user that will pay for the transaction.
        payer = user, 
        // The space needed for the account is the size of the discriminator + the size of the `Favourites` struct.
        space = ANCHOR_DISCRIMINATOR_SIZE + Favourites::INIT_SPACE,
        // The seeds are the `favourites` and the user's public key.
        // Because `user` is present in the seed, each user will have a different account (own favourites). 
        seeds = [b"favourites", user.key().as_ref()], bump
    )]
    // Data is stored in the `Account` struct, and is of a type `Favourites`.
    pub favourites: Account<'info, Favourites>,

    // System program account is needed to create (`init`) the account.
    pub system_program: Program<'info, System>,
}

// The `Favourites` struct is the data that will be stored in the account (on-chain).
#[account]
// We derive the `InitSpace` attribute to calculate the space needed for the account.
#[derive(InitSpace)]
pub struct Favourites {
    // The user's favourite number, will correspond to the `BN` type in the tests.
    pub number: u64,

    // We need to specify the max length of the string.
    #[max_len(50)]
    pub color: String,

    // We need to specify the max length of the vector and the max length of each string.
    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}
