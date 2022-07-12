import os
import yaml
import asyncio

from engine import Server, ServerConfig


def main():
    conf_source = {}

    with open('default_config.yaml', 'r') as f:
        conf_source.update(yaml.safe_load(f))

    if os.path.isfile('config.yaml'):
        with open('config.yaml', 'r') as f:
            conf_source.update(yaml.safe_load(f))

    config = ServerConfig.from_dict(conf_source)
    server = Server(config)
    asyncio.run(server.run())


if __name__ == "__main__":
    main()
