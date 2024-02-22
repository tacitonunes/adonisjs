import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'momentos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /*Criado por mim */
      table.string('title')
      table.string('description')
      table.string('image')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
