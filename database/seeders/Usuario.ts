import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Usuario from "App/Models/Usuario";

export default class extends BaseSeeder {
  public async run() {
    // await Usuario.createMany([
    //   {
    //     email: 'admin@admin.com',
    //     password: '123456',
    //   },
    //   {
    //     email: 'romain@adonisjs.com',
    //     password: 'supersecret'
    //   }
    // ])

    await Usuario.create(
      {
        email: 'admin@admin.com',
        password: '123456',
      }
    )
  }
}
