package repository

//	func Test_postgres_InsertMetadata(t *testing.T) {
//		dbPool, err := pgxpool.Connect(context.Background(), "postgres://indexer:1337@localhost:1338/mark3d_indexer")
//		if err != nil {
//			t.Fatalf("failed to connect to db: %v", err)
//		}
//		defer dbPool.Close()
//
//		p := &postgres{pg: dbPool}
//
//		ctx := context.Background()
//
//		metadata := &domain.TokenMetadata{
//			Id:          0,
//			Name:        "test_name",
//			Description: "test_description",
//			Image:       "test_image",
//			HiddenFile:  "test_hidden_file",
//			Category:    "test_category",
//			Subcategory: "test_subcategory",
//			Attributes: []*domain.MetadataProperty{
//				{TraitType: "attr_trait_type1", DisplayType: "attr_display_type1", Value: "attr_value1"},
//				{TraitType: "attr_trait_type2", DisplayType: "attr_display_type2", Value: "attr_value2"},
//			},
//			Stats: []*domain.MetadataProperty{
//				{TraitType: "stat_trait_type1", DisplayType: "stat_display_type1", Value: "stat_value1"},
//				{TraitType: "stat_trait_type2", DisplayType: "stat_display_type2", Value: "stat_value2"},
//			},
//			Rankings: []*domain.MetadataProperty{
//				{TraitType: "rank_trait_type1", DisplayType: "rank_display_type1", Value: "rank_value1"},
//				{TraitType: "rank_trait_type2", DisplayType: "rank_display_type2", Value: "rank_value2"},
//			},
//			Tags: []string{"tag1", "tag2"},
//		}
//
//		// Before
//		var metadataCountBefore, propertiesCountBefore, tagsCountBefore int
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata").Scan(&metadataCountBefore)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata count: %v", err)
//		}
//
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata_properties").Scan(&propertiesCountBefore)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata_properties count: %v", err)
//		}
//
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata_tags").Scan(&tagsCountBefore)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata_properties count: %v", err)
//		}
//
//		// Do
//		tx, err := p.pg.Begin(ctx)
//		if err != nil {
//			t.Fatalf("failed to start transaction: %v", err)
//		}
//		defer tx.Rollback(ctx)
//
//		metadataId, err := p.InsertMetadata(ctx, tx, metadata)
//		if err != nil {
//			t.Fatalf("failed to insert metadata: %v", err)
//		}
//
//		err = tx.Commit(ctx)
//		if err != nil {
//			t.Fatalf("failed to commit transaction: %v", err)
//		}
//
//		// check that metadata was inserted correctly
//		var count int
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata").Scan(&count)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata count: %v", err)
//		}
//		assert.Equal(t, metadataCountBefore+1, count)
//
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata_properties").Scan(&count)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata_properties count: %v", err)
//		}
//		assert.Equal(t, propertiesCountBefore+len(metadata.Attributes)+len(metadata.Rankings)+len(metadata.Stats), count)
//
//		err = dbPool.QueryRow(ctx, "SELECT COUNT(*) FROM token_metadata_tags").Scan(&count)
//		if err != nil {
//			t.Fatalf("failed to query token_metadata_tags count: %v", err)
//		}
//		assert.Equal(t, tagsCountBefore+len(metadata.Tags), count)
//
//		// Clean up
//		if _, err := dbPool.Exec(ctx, "DELETE FROM token_metadata WHERE id=$1", metadataId); err != nil {
//			t.Error(err)
//		}
//	}
//func Test_postgres_GetMetadata(t *testing.T) {
//	dbPool, err := pgxpool.Connect(context.Background(), "postgres://indexer:1337@localhost:1338/mark3d_indexer")
//	if err != nil {
//		t.Fatalf("failed to connect to db: %v", err)
//	}
//	defer dbPool.Close()
//
//	p := &postgres{pg: dbPool}
//	ctx := context.Background()
//
//	collection := domain.Collection{
//		Address:     common.BigToAddress(big.NewInt(0)),
//		Creator:     common.BigToAddress(big.NewInt(0)),
//		Owner:       common.BigToAddress(big.NewInt(0)),
//		TokenId:     big.NewInt(0),
//		MetaUri:     "",
//		Name:        "",
//		Description: "",
//		Image:       "",
//	}
//
//	metadata := domain.TokenMetadata{
//		Name:         "n1",
//		Description:  "d1",
//		Image:        "i1",
//		ExternalLink: "el1",
//		HiddenFile:   "hf1",
//		HiddenFileMeta: &domain.HiddenFileMetadata{
//			Name: "hn1",
//			Type: "ht1",
//			Size: 1,
//		},
//		License:    "l1",
//		LicenseUrl: "lu1",
//		Properties: []*domain.MetadataProperty{
//			domain.NewMetadataProperty("t1", "1", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t2", "", "v1", "", ""),
//			domain.NewMetadataProperty("t2", "", "v1", "", ""),
//			domain.NewMetadataProperty("t3", "", "v1", "", ""),
//		},
//		Rankings: []*domain.MetadataProperty{
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//		},
//		Stats: []*domain.MetadataProperty{
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//		},
//		Categories:    []string{"1", "2"},
//		Subcategories: []string{"3", "4"},
//		Tags:          []string{"5", "6"},
//	}
//
//	token := domain.Token{
//		CollectionAddress: collection.Address,
//		CollectionName:    "",
//		TokenId:           big.NewInt(0),
//		Owner:             common.Address{},
//		Creator:           common.Address{},
//		MintTxTimestamp:   0,
//		MintTxHash:        common.Hash{},
//		MetaUri:           "",
//		Metadata:          &metadata,
//	}
//
//	tx, err := p.pg.Begin(ctx)
//	if err != nil {
//		t.Fatalf("failed to start transaction: %v", err)
//	}
//	defer tx.Rollback(ctx)
//
//	err = p.InsertCollection(ctx, tx, &collection)
//	if err != nil {
//		t.Fatalf("failed to insert collection: %v", err)
//	}
//
//	err = p.InsertToken(ctx, tx, &token)
//	if err != nil {
//		t.Fatalf("failed to insert token: %v", err)
//	}
//
//	gotMetadata, err := p.GetMetadata(ctx, tx, token.CollectionAddress, token.TokenId)
//	if err != nil {
//		t.Fatalf("failed to get metadata: %v", err)
//	}
//
//	fmt.Printf("%#v\n", gotMetadata)
//	fmt.Printf("%#v\n", gotMetadata.HiddenFileMeta)
//	for _, mp := range gotMetadata.Properties {
//		fmt.Printf("%#v\n", *mp)
//	}
//	for _, mp := range gotMetadata.Rankings {
//		fmt.Printf("%#v\n", *mp)
//	}
//	for _, mp := range gotMetadata.Stats {
//		fmt.Printf("%#v\n", *mp)
//	}
//
//	//assert.True(t, reflect.DeepEqual(gotMetadata, metadata))
//}

// Test for GetTraitCount and underlying Trigger
//func Test_postgres_GetTraitCount(t *testing.T) {
//	dbPool, err := pgxpool.Connect(context.Background(), "postgres://indexer:1337@localhost:1338/mark3d_indexer")
//	if err != nil {
//		t.Fatalf("failed to connect to db: %v", err)
//	}
//	defer dbPool.Close()
//
//	p := &postgres{pg: dbPool}
//	ctx := context.Background()
//
//	collection := domain.Collection{
//		Address: common.BigToAddress(big.NewInt(0)),
//		Creator: common.BigToAddress(big.NewInt(0)),
//		Owner:   common.BigToAddress(big.NewInt(0)),
//		TokenId: big.NewInt(0),
//	}
//
//	metadata := domain.TokenMetadata{
//		HiddenFileMeta: &domain.HiddenFileMetadata{},
//		Properties: []*domain.MetadataProperty{
//			// t1v1 - 4
//			domain.NewMetadataProperty("t1", "1", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			domain.NewMetadataProperty("t1", "", "v1", "", ""),
//			// t1v2 - 2
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			// t2v1 - 2
//			domain.NewMetadataProperty("t2", "", "v1", "", ""),
//			domain.NewMetadataProperty("t2", "", "v1", "", ""),
//			// t3v1 - 1
//			domain.NewMetadataProperty("t3", "", "v1", "", ""),
//		},
//		Rankings: []*domain.MetadataProperty{
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//		},
//		Stats: []*domain.MetadataProperty{
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//			domain.NewMetadataProperty("t1", "", "v2", "", ""),
//		},
//		Categories:    []string{},
//		Subcategories: []string{},
//		Tags:          []string{},
//	}
//
//	token := domain.Token{
//		CollectionAddress: collection.Address,
//		TokenId:           big.NewInt(0),
//		Owner:             common.Address{},
//		Creator:           common.Address{},
//		MintTxHash:        common.Hash{},
//		Metadata:          &metadata,
//	}
//
//	tx, err := p.pg.Begin(ctx)
//	if err != nil {
//		t.Fatalf("failed to start transaction: %v", err)
//	}
//	defer tx.Rollback(ctx)
//
//	err = p.InsertCollection(ctx, tx, &collection)
//	if err != nil {
//		t.Fatalf("failed to insert collection: %v", err)
//	}
//
//	err = p.InsertToken(ctx, tx, &token)
//	if err != nil {
//		t.Fatalf("failed to insert token: %v", err)
//	}
//
//	// Do
//	count, overall, err := p.GetTraitCount(ctx, tx, "t1", "v1")
//	if err != nil {
//		t.Fatalf("failed to get trait count: %v", err)
//	}
//
//	assert.Equal(t, 4, count)
//	assert.Equal(t, 6, overall)
//
//	if _, err := tx.Exec(ctx, "DELETE FROM token_metadata_properties WHERE trait_type = 't1' AND value = 'v1' AND display_type = '1'"); err != nil {
//		t.Error(err)
//	}
//
//	count, overall, err = p.GetTraitCount(ctx, tx, "t1", "v1")
//	if err != nil {
//		t.Fatalf("failed to get trait count: %v", err)
//	}
//	assert.Equal(t, 3, count)
//	assert.Equal(t, 5, overall)
//}
