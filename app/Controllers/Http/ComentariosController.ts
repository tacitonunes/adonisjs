import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Momento from 'App/Models/Momento';
import Comentario from 'App/Models/Comentario';

export default class ComentariosController {

    //#11:Curso-Adonis - Criamos a função de inserção do recurso
    public async store({request, response, params}: HttpContextContract){

        try {
            const body = request.body();
            const momId = params.momentoId;
            const momento = await Momento.findOrFail(momId);
            body.momentoId = momId;
            const comentario = await Comentario.create(body);
            response.status(201).append('Location',`${request.url()}/${comentario.id}`).send({
                message: "Comentário enviado com sucesso!",
                data: comentario,
                post: momento
            });
        } catch (error){
            if(error.code == 'E_ROW_NOT_FOUND'){
                response.status(404).send({
                    message:"Não há postagem registrada com o ID procurado (" + params.momentoId + ") para inserir o comentário.",
                    code: 404
                });
                return;
            }
            response.status(500).send({
                message: error.message,
                trace: error.trace
            });
        }
    }

}
