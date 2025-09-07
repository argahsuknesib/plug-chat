# Plug Chat 

A multi-provider AI chat application to chat with multiple AI models including OpenAI GPT, Groq (Llama), and Anthropic Claude - all in one interface!

## Why did I make this?

I think the billing model for LLMs are kind of weird right now. It is like a buffet, you pay for what you eat, but you don't know how much you will eat.

Some people might eat a lot, some people might eat a little. Some people might eat expensive food, some people might eat cheap food.

I for one, don't eat a lot of GPU cycles. I don't think I need the most powerful model all the time. Sometimes, a smaller model is just fine. Moreover, paying 25 euro a month for ChatGPT Plus is too much for me, especially when I don't use it that much. Although I do like to use GPT-5 sometimes, I don't need it all the time. 

So, I made this app to switch between models easily, and use the most appropriate model for my needs and "pay as I go" rather than "pay for a buffet".

I see it very similar to paying for electricity. You pay for what you use, not for a flat rate. 
It would be insane to pay 100 euro a month for electricity when you only use 20 euro worth of electricity. 

I also know that a lot of applications like Plug Chat already exist, but I wanted to make one that with a front-end that I like, and tbh I just wanted to make it for fun and learn some new things.


## Features

- **Multi-Provider Support**: OpenAI, Groq, and Anthropic models
- **Markdown Support**: Rich text formatting, code blocks, and syntax highlighting
- **Clean UI**: macOS-inspired design with beautiful typography
- **Model Switching**: Switch between AI models mid-conversation
- **Database Integration**: PostgreSQL with vector search. 

## Future Plans

- At the moment, only conversation history is stored and limited vector search is implemented with only 5 similar items to be fetched from the pgvector database. More features to be added soon!
- Voice input and output
- File uploads and search with the files.
- Video input and output.
- Support for reasoning models

I personally would never use those features, but if you want them, please open an issue or a PR!

> 💡 **Note on Vector Search**
>
> Vector search is especially powerful when you want to chat with your own data
> Right now, Plug Chat uses Postgres + pgvector for basic semantic recall, but I plan to 
> implement a more robust vector search pipeline in the future.  
>
> I’m also interested in exploring Knowledge Graph Embeddings with LLMs to see how 
> structured knowledge and semantic memory can work together.  
>
> Stay tuned — contributions are welcome if you’d like to help shape this!

## Quick Start

Check out the [INSTALL.md](INSTALL.md) for detailed installation instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
