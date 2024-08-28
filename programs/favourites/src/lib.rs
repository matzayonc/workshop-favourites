use anchor_lang::prelude::*;

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

declare_id!("7eLAo756veqmTo4192BLmjTW3pfeZMQYjis1zU6SLX64");

#[program]
pub mod favourites {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        msg!("Greetings from {}", ctx.program_id);
        let user_public_key = ctx.accounts.user.key();
        msg!("User {user_public_key}'s favorite number is {number}, favorite color is: {color}",);

        msg!("User's hobbies are: {:?}", hobbies);

        ctx.accounts.favourites.set_inner(Favourites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(init, payer = user, space = ANCHOR_DISCRIMINATOR_SIZE + Favourites::INIT_SPACE,
        seeds = [b"favourites", user.key().as_ref()], bump
    )]
    pub favourites: Account<'info, Favourites>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Favourites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,

    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}
