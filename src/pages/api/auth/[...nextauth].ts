import NextAuth, {NextAuthOptions, User} from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    Auth0Provider({
      clientId: process.env.CLIENT_ID || '',
      clientSecret: process.env.CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER,
      wellKnown: undefined,
      idToken: false,
      authorization: {
        url: process.env.OAUTH_AUTHORIZATION_URL,
        params: {
          scope: ''
        },
      },
      token: {
        url: process.env.OAUTH_TOKEN_URL, async request({client, params, checks, provider}) {

          const response = await client.oauthCallback(
            provider.callbackUrl,
            params,
            checks,
            {
              exchangeBody: {
                client_id: process.env.CLIENT_ID,
              }
            }
          )
          return {
            tokens: response
          }
        }
      },
      userinfo: process.env.OAUTH_USERINFO_URL,
      profile(p, tokens): User {
        return {id: "3213213", email: p.email}
      }
      // issuer:
    }),
  ],
  callbacks: {
    async jwt({token, account}) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({session, token, user}) {
      // Send properties to the client, like an access_token from a provider.
      if (token) {
        // @ts-ignore
        session.accessToken = token.accessToken
      }
      console.log(session)
      return session
    },

    // session: async ({session, user, token}) => {
    //   // if (session?.user) {
    //   //   session.user.id = user.id;
    //   // }
    //
    //   console.log('session callback', session);
    //   console.log('token callback', token);
    //   console.log('user callback', user);
    //   return session;
    // },
  },
}

export default NextAuth(authOptions)
