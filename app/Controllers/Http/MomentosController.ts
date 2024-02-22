import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

import Momento from 'App/Models/Momento'

import Application from '@ioc:Adonis/Core/Application';
import {v4 as uuidv4} from 'uuid'
import {Exception} from '@adonisjs/core/build/standalone';
import {unlink, existsSync} from 'fs';

export default class MomentosController {

  private validationOptions = {
    types: ["image"],
    size: "2mb"
  }

  public async store({request, response}: HttpContextContract) {
    try {
      const body = request.body();
      const image = request.file('image', this.validationOptions);
      if (!body.title) {
        throw new Exception("Um título é obrgatório", 400);
      }
      if (!body.description) {
        throw new Exception("Uma descrição é obrigatória", 400);
      }
      if (!image) {
        throw new Exception("Uma imagem é obrigatória", 400);
      }
      if (image) {
        const imgName = `${uuidv4()}.${image.extname}`;
        await image.move(Application.tmpPath('Uploads'), {name: imgName});
        body.image = imgName;
      }
      await Momento.create(body)
        .then((mom) => {
          response.append('Location', `${request.url()}/${mom.id}`).status(201).send({
            message: "Postagem criada com sucesso",
            data: mom
          });
        });
    } catch (error) {
      response.status(error.status).send({
        message: error.message,
        code: error.status
      });
    }
  }

  //Método para mostrar todos os recursos do DB (Resources)
  public async index({response}: HttpContextContract) {
    //await Momento.query().preload('comentarios').then((mom) => {
    await Momento.all()
      .then((mom) => {
        response.status(200).send({
          message: "Lista de postagens recuperadas",
          data: mom
        });
      })
      .catch((error) => {
        response.status(error.status).send({
          message: error.message,
          code: error.status
        });
      });
  }

  //Método para mostrar um recurso específico no DB (Resources)
  public async show({response, params}: HttpContextContract) {
    //const momento = await Momento.findOrFail(params.id);
    await Momento.findOrFail(params.id)
      .then(async (mom) => {
        await mom.load('comentarios');
        response.status(200).send({
          message: "Postagem recuperada",
          data: mom
        });
      })
      .catch((error) => {
        if (error.code == 'E_ROW_NOT_FOUND') {
          response.status(error.status).send({
            message: "Não há postagem registrada com o ID procurado (" + params.id + ")",
            code: error.status
          });
          return;
        }
      });
  }

  public async update({request, response, params}: HttpContextContract) {
    const body = request.body();
    await Momento.findOrFail(params.id)
      .then(async (mom) => {
        if (body.title && body.title != mom.title) mom.title = body.title;
        if (body.description && body.description != mom.description) mom.description = body.description;

        //Trocando a imagem, se recebida
        const image = request.file('image', this.validationOptions);
        if (image) {
          //Excluindo a imagem existente no diretório
          const arquivo: string = Application.tmpPath('Uploads') + `/${mom.image}`;
          unlink(arquivo, (err) => {
            if (err) {
              throw new Exception("Não foi possível remover a postagem, pois há um problema com o servidor de arquivos.", 500)
            }
            console.log("Arquivo removido com sucesso!");
          });
          //Salvando uma nova imagem
          const imgName = `${uuidv4()}.${image.extname}`;
          await image.move(Application.tmpPath('Uploads'), {name: imgName});
          mom.image = imgName;
          console.log("Nova imagem anexada à postagem");
        }
        await mom.save();
        response.status(200).send({
          message: "Postagem Atualizada com sucesso!",
          data: mom
        });
      })
      .catch((error) => {
        if (error.code == 'E_ROW_NOT_FOUND') {
          response.status(404).send({
            message: "Não há postagem registrada com o ID " + params.id + " a ser atualizada",
            code: 404
          });
          return;
        }
        response.status(error.status).send({
          message: error.message,
          code: error.status
        });
      });
  }

  public async destroy({response, params}: HttpContextContract) {
    await Momento.findOrFail(params.id)
      .then(async (mom) => {
        const arquivo: string = Application.tmpPath('Uploads') + `/${mom.image}`;
        if (existsSync(arquivo)) {
          unlink(arquivo, (err) => {
            if (err) {
              throw new Error("Não foi possível remover a postagem, pois há um problema com o servidor de arquivos.")
            }
            console.log("Arquivo removido com sucesso!");
          });
        }
        await mom.delete()
          .then((mo) => {
            response.status(200).send({
              message: "Postagem Excluída com sucesso!",
              data: mo
            });
          })
      })
      .catch((error) => {
        if (error.code == 'E_ROW_NOT_FOUND') {
          response.status(404).send({
            message: "Não há postagem registrada com o ID " + params.id + " a ser excluída",
            code: 404
          });
          return;
        }
        response.status(error.status).send({
          message: error.message,
          code: error.status
        });
      });
  }
}


