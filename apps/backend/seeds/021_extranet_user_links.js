/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Get default user
  const user = await knex('user').first()
  if (!user) return

  // Get first coproprietaire that isn't already linked
  const copro = await knex('coproprietaires').whereNull('user_id').first()
  if (!copro) return

  // Link them
  await knex('coproprietaires')
    .where('id', copro.id)
    .update({ user_id: user.id })
}
