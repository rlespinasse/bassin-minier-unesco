# Contribuer au projet

Bienvenue ! Les contributions à ce projet sont les bienvenues, que ce soit pour signaler un bug, proposer une amélioration ou soumettre du code.

## Prérequis

Le projet utilise les outils suivants :

- [mise](https://mise.jdx.dev/) — gestion des outils (installe automatiquement Python et just)
- [just](https://just.systems/) — exécution des commandes du projet

Consultez le guide d'[installation](docs/how-to/installation.md) pour la mise en place complète.

## Comment contribuer

### Signaler un problème

Ouvrez une [issue](../../issues) en décrivant le problème rencontré, les étapes pour le reproduire et le comportement attendu.

### Proposer une modification

1. Forkez le dépôt
2. Créez une branche pour votre modification (`git checkout -b ma-modification`)
3. Effectuez vos changements
4. Vérifiez que le site fonctionne localement (voir [développement local](docs/how-to/developpement-local.md))
5. Committez vos changements en suivant les conventions ci-dessous
6. Poussez votre branche et ouvrez une pull request

## Installation locale

Suivez les guides existants :

- [Installation](docs/how-to/installation.md) — prérequis et dépendances
- [Développement local](docs/how-to/developpement-local.md) — lancer le serveur local

## Conventions

### Messages de commit

Ce projet suit la spécification [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```text
type(scope): description courte
```

Types courants : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

### Style de code

- HTML/CSS/JS statique pour le site
- Python pour les scripts de conversion de données
- Privilégiez la simplicité et la lisibilité

## Licence

- Le **code** est sous [licence MIT](LICENSE.md).
- Les **données** sont sous [Licence Ouverte ETALAB v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).
