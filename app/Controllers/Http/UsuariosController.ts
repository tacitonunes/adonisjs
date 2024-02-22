import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import Hash from "@ioc:Adonis/Core/Hash";
import axios from "axios";
//import FormData from "form-data";
import qs from 'qs';


export default class UsuariosController {

  public async store({request, response}: HttpContextContract) {
    const user = {
      email: request.input('email'),
      password: request.input('password')
    }
    if (!user.email || !user.password) {
      return response.status(400).send({message: 'Por favor, envie os parâmetros de email e password para criação do usuário.'})
    }
    await Usuario.create(user)
      .then((u) => {
        return response.created({message: 'Usuario criado com sucesso!', user: u})
      })
      .catch(() => {
        return response.badRequest({message: 'Não foi possível criar o usuário'})
      })
  }

  public async weblogin({auth, request, response}: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    // Lookup user manually
    const usr = await Usuario
      .query()
      .where('email', email)
      //.where('tenant_id', getTenantIdFromSomewhere)
      //.whereNull('is_deleted')
      .firstOrFail()

    // Verify password
    if (!(await Hash.verify(usr.password, password))) {
      return response.badRequest('Login e/ou Senha Inválido(s)')
    }

    // Create session
    await auth.use('web').login(usr)

  }

  public async apilogin({auth, request, response}: HttpContextContract) {

    try {
      const {email, password} = request.body()
      if (!email || !password) {
        throw new Error('Por favor, envie os parâmetros corretos, conforme documentação, para realizar o login corretamente!')
      }
      const usr = await Usuario.query()
        .where('email', email)
        //.where('tenant_id', getTenantIdFromSomewhere)
        .whereNull('is_deleted')
        .firstOrFail().catch(() => {
          throw new Error('Login e/ou Senha Inválido(s)')
        })
      // Verify password
      if (!(await Hash.verify(usr.password, password))) {
        throw new Error('Login e/ou Senha Inválido(s)')
      }
      await auth.use('api').generate(usr, {expiresIn: '30mins'})
        .then((re) => {
          return response.status(200).send({usuario: usr, auth: re})
        })
        .catch(() => {
          throw new Error('Login e/ou Senha Inválido(s)')
        })
    } catch (err) {
      return response.badRequest({message: err.message})
    }
  }

  public async githublogin({ally, auth, response}) {
    const github = ally.use('github')
    if (github.accessDenied()) {
      return 'Access was denied'
    }
    if (github.stateMisMatch()) {
      return 'Request expired. Retry again'
    }
    if (github.hasError()) {
      console.log('Erro')
      return github.getError()
    }

    const githubUser = await github.user()

    const usr = await Usuario.firstOrCreate({
      email: githubUser.email,
    }, {})

    await auth.use('api').generate(usr, {expiresIn: '30mins'})
      .then((re) => {
        return response.status(200).send({usuario: usr, auth: re})
      })
      .catch(() => {
        throw new Error('Login e/ou Senha Inválido(s)')
      })
  }

  public async azureadlogin({response}: HttpContextContract) {
    return response.redirect().toPath('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=15fd3905-a36a-4ed2-a4de-0ff19c05d6cd&response_type=code&redirect_uri=http://localhost:3333/auth/azuread/callback&response_mode=query&scope=openid%20profile%20email&state=nodejspoc')
  }

  public async azureadcallback({auth, request, response}: HttpContextContract) {
    try {
      const {code/*, state*/} = request.qs()
      const data = {
        'client_id': '15fd3905-a36a-4ed2-a4de-0ff19c05d6cd',
        'scope': 'openid profile email',
        'redirect_uri': 'http://localhost:3333/auth/azuread/callback',
        'grant_type': 'authorization_code',
        'client_secret': 'BLu8Q~zKyhAAXF2FMiM3~qXO9S1LO_~ZTO8gOanV',
        'code': code
      }
      const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: qs.stringify(data),
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
      }

      await axios(options)
        .then(async (responseAx1) => {
          //console.log(JSON.stringify(responseAx1.data))
          const {token_type, expires_in, access_token} = responseAx1.data
          if (expires_in > 0) {
            await axios({
              method: 'GET',
              url: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'
            }).then(async (responseAx2) => {
              const {userinfo_endpoint} = responseAx2.data
              await axios({
                method: 'GET',
                headers: {'Authorization': token_type + ' ' + access_token},
                url: userinfo_endpoint
              }).then(async (responseAx3) => {
                //{"sub":"AAAAAAAAAAAAAAAAAAAAADHtZy7rwBcahd0nLYBYqts","name":"Tácito Nunes","given_name":"Tácito","family_name":"Nunes","email":"tacito.nunes@hotmail.com","picture":"https://graph.microsoft.com/v1.0/me/photo/$value"}
                //console.log(JSON.stringify(responseAx3.data.email))
                const usr = await Usuario.firstOrCreate({email: responseAx3.data.email}, {})
                await auth.use('api').generate(usr, {
                  expiresIn: '30mins'
                }).then((respAuth) => {
                  return response.status(200).send({usuario: usr, auth: respAuth})
                }).catch(() => {
                  throw new Error('Login e/ou Senha Inválido(s)')
                })
              }).catch((err) => {
                throw new Error(err.message)
              })
            })
          }
        })
    } catch (err) {
      return response.badRequest({message: err.message})
    }
  }
}
