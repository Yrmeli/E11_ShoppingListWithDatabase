
// Import
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, FlatList} from'react-native';
import * as SQLite from 'expo-sqlite';

// Avaa tietokanta tai luo se, jos tietokantaa ei olemassa (palauttaa tietokanta-objektin)
const db = SQLite.openDatabase('shoppingdb.db');

// Main
export default function App() {

	const [product, setProduct] = useState('');
	const [amount, setAmount] = useState('');
	const [list, setList] = useState([]);

	const initialFocus = useRef(null);

	// Luo käynnistettäessä taulun 'item' tietokantaan (mikäli taulu ei ole jo olemassa)
	useEffect(() => {
		db.transaction(tx => {
		tx.executeSql('create table if not exists item (id integer primary key not null, product txt, amount text);');
		});
		updateList();    
	}, []);

	/*	Tallenna
		Metodi suoritetaan Save-nappulaa painettaessa. Ottaa product- ja amount-tiloista arvot, lisää ne kysymysmerkkien paikalle sql-lauseeseen ja luo näin rivin item-tauluun. 
	*/
	const saveItem = () => {
		if (product && amount) {
			db.transaction(tx => {
				tx.executeSql('insert into item (product, amount) values (?, ?);', [product, amount]);    
			}, null, updateList
			);
			setProduct('');
			setAmount('');
			initialFocus.current.focus();
		}
	}

	/*	Päivitä
		Hakee kaikki rivit item-taulusta ja tallentaa ne list-tilaan.
	*/
	const updateList = () => {
		db.transaction(tx => {
		tx.executeSql('select * from item;', [], (_, { rows }) =>
			setList(rows._array)
		); 
		});
	}

	/*	Poista
		FlatList-listauksessa jokaisella ostoksella 'bought'-tekstikomponentti, jota painettaessa deletoidaan ostos ja päivitetään listaus.
	*/
	const deleteItem = (id) => {
		db.transaction(
		tx => {
			tx.executeSql(`delete from item where id = ?;`, [id]);
		}, null, updateList
		)    
	}

	return (
		<View style={styles.container}>

			<TextInput 
			ref = {initialFocus}
			placeholder = 'Product' 
			style = {styles.input}
			onChangeText = {(product) => setProduct(product)}
			value = {product}
			/>  

			<TextInput 
			placeholder = 'Amount' 
			keyboardType = "numeric" 
			style = {styles.input}
			onChangeText = {(amount) => setAmount(amount)}
			value = {amount}
			/>  

			<View style={{margin:40}}>
				<Button onPress = {saveItem} title="Save" /> 
			</View>

			<FlatList 
			ListHeaderComponent = { () => <Text style={styles.otsikko}> Shopping list </Text>}
			keyExtractor = {item => item.id.toString()} 
			renderItem = {({item}) => 
			<View style = {styles.listcontainer}>
				<Text>{item.product}, {item.amount} </Text>
				<Text style={{color: 'red'}} onPress={() => deleteItem(item.id)}>Bought</Text>
			</View>} 
			data = {list} 
			/>   

			<StatusBar hidden={true} />

		</View>

	);
}

// Tyyli
const styles = StyleSheet.create({
    container: {
        paddingTop:100,
        height:100,
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    input:{
        color:'red',
        padding:5,
        margin:5,
        width:200, 
        borderColor:'gray', 
        borderWidth:1
    },
	listcontainer: {
		flexDirection: 'row',
		padding: 5,
		justifyContent:'space-between'
	},
	otsikko: {
		fontWeight:'900',
		fontSize:20,
	}
});
