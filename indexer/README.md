# Бекенд индексер mark3d коллекций
## Установка зависимостей
Установка abigen'а:
```shell
go install github.com/ethereum/go-ethereum@v1.10.26
cd $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.26
make devtools
```
## Примеры файлов
bafkreigvhqdkzejtpwlidazldr75b3bkuomww2kqzb3lzbkwco2a4bz5je - зашифрованный паролем 13371337 файл

bafkreif4tq74xqr4rvzwogpnbuujgc4yg5azrdfj7yzdzyk6gdattu5yry - зашифрованный паролем 13371337 файл (сломанный, руками один байт подкрутил)

bafkreiawng5ztw575dqotb7efmdbfcaq3upsbn4q6yocytgetxtvmb3yiu - лобанов

bafkreifkjpnkion2ztxrvrzl4yjadjorx4fck34x5fx7s6qfnqkvuekfcm - метаданные с корректным файлом

bafkreic2d5w64m7aspwshkklq6rkq2nq3thm4rt7wzbpwdomcfywnrmp5m - метаданные со сломанным файлом

