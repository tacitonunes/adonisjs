import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
//import Application from "@ioc:Adonis/Core/Application";

export default class extends BaseSeeder {

  private async runSeeder(seeder: { default: typeof BaseSeeder }) {

    //Abaixo, só realiza o seed se em modo Development
    // if (seeder.default.developmentOnly && !Application.inDev) {
    //   return
    // }

    await new seeder.default(this.client).run()
  }

  public async run() { //Ordenando os seeds
    await this.runSeeder(await import('../Usuario')) // 1
  }
}
