import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  }
}>();


app.use("/api/v1/blog/*",async(c,next)=>{
  const header=c.req.header("authorization") || "";
  const response=await verify(header,c.env.JWT_SECRET)
  if(response.id){
    next();
  }else{
    c.status(403);
    return c.json({ error: "Unauthorised" });

  }
})

app.post('/api/v1/signup', async (c) => {
  // Ensure DATABASE_URL is directly passed
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    });

    

    if (!c.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e) {
    
    c.status(403);
    return c.json({ error: "error while signing up" });
  } 
});

app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: c.env.DATABASE_URL } },
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email
      }
    });

    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }

    console.log("JWT_SECRET:", c.env.JWT_SECRET);

    if (!c.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e) {
    
    c.status(403);
    return c.json({ error: "error while signing in" });
  } 
});

app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id");
  console.log(id);

  return c.text("get Blog route");
});

app.post("/api/v1/blog", (c) => {
  return c.text("Post blog route");
});

app.put("/api/v1/blog", (c) => {
  return c.text("Update blog route");
});

export default app;
