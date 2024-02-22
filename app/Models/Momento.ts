/*
  #4:Curso-Adonis - Criar entidades de relacionamento com uma migration (-m)
      node ace make:model <NomeEntidadeSingular> -m

	  4.1 - Abrir o arquivo criado em app/Models e inserir os atributos necessários
*/

import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

//#10.1: Curso-Adonis - Criar o relacionamento com os comentários
import Comentario from './Comentario'

export default class Momento extends BaseModel {

  //#10.1: Curso-Adonis - Criar o relacionamento com os comentários
  @hasMany(() => Comentario)
  public comentarios: HasMany<typeof Comentario>

  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
