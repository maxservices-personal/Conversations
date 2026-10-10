# Conversations backend

This backend requires Python 3.10 and [uv](https://docs.astral.sh/uv/).

```powershell
uv sync
uv run app
```

Set the required application configuration in a `.env` file before starting the
server, including `MONGODB_URI` and a valid Fernet `MESSAGE_SECRET_KEY`.