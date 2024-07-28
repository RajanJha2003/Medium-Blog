import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
	}
}>();

app.post('/api/v1/signup', async (c) => {



const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());

const body=await c.req.json();

  try {
    const user=await prisma.user.create({
      data:{
        email:body.email,
        password:body.password
      }
    })
    
  } catch (error) {
    
  }
  return c.text('Signup Route')
})


app.post('/api/v1/signin', (c) => {
  return c.text('Signin Route')
})

app.get('/api/v1/blog/:id', (c) => {
  const id=c.req.param('id')
  console.log(id);

  return c.text('get Blog route');
})

app.post('/api/v1/blog', (c) => {
  return c.text('Post blog route')
})


app.put('/api/v1/blog', (c) => {
	return c.text('Update blog route')
})



export default app
