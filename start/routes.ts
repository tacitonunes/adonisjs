/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";

Route.get('/', async ({response}: HttpContextContract) => {
  response.redirect().toRoute('api')
})

Route.group(() => {
  Route.get('', () => {
    return {message: 'Você está na nossa API'}
  }).as('api')
  Route.resource('/momentos', 'MomentosController').apiOnly()
  Route.group(() => {
    Route.post('/:momentoId/comentarios', 'ComentariosController.store')
  }).prefix('/momentos')
  Route.resource('/usuarios', 'UsuariosController').apiOnly()
}).prefix('/api').middleware('auth:api')

Route.group(() => {
  Route.post('/', 'UsuariosController.apilogin').as('apilogin')
  //Route.post('/web', 'UsuariosController.webLogin').as('weblogin')

  //Login with GitHub
  Route.group(() => {
    Route.get('/login', async ({ally}) => {
      return ally.use('github').redirect()
    })
    Route.get('/callback', 'UsuariosController.githublogin').as('githublogin')
  }).prefix('/github')

  //Login with AzureAD
  Route.group(() => {
    Route.get('/login', 'UsuariosController.azureadlogin').as('azureadlogin')
    Route.get('/callback', 'UsuariosController.azureadcallback').as('azureadcallback')
  }).prefix('/azuread')

}).prefix('/auth')
