CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(500) NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
