import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { VictoryPie, VictoryLine, VictoryChart, VictoryTheme, VictoryAxis, VictoryScatter } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Types
type Asset = {
  name: string;
  value: number;
  allocation: number;
  performance: number;
};

type HistoricalData = {
  date: string;
  value: number;
};

type StockPosition = {
  symbol: string;
  name: string;
  purchases: {
    date: string;
    quantity: number;
    price: number;
  }[];
  sells: {
    date: string;
    quantity: number;
    price: number;
  }[];
  currentPrice: number;
};

type StockHistoricalData = {
  date: string;
  price: number;
};

// Mock data
const investmentAssets: Asset[] = [
  { name: 'Actions', value: 50000, allocation: 50, performance: 8.5 },
  { name: 'Obligations', value: 30000, allocation: 30, performance: 3.2 },
  { name: 'Immobilier', value: 15000, allocation: 15, performance: 5.7 },
  { name: 'Liquidités', value: 5000, allocation: 5, performance: 0.5 },
];

const historicalPerformance: HistoricalData[] = [
  { date: '2023-01', value: 95000 },
  { date: '2023-02', value: 97000 },
  { date: '2023-03', value: 98500 },
  { date: '2023-04', value: 101000 },
  { date: '2023-05', value: 100000 },
];

const stockPositions: StockPosition[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    purchases: [
      { date: '2022-01-15', quantity: 10, price: 150 },
      { date: '2022-06-30', quantity: 5, price: 140 },
      { date: '2023-02-10', quantity: 8, price: 160 },
    ],
    sells: [
      { date: '2022-01-16', quantity: 10, price: 152 },
    ],
    currentPrice: 175,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    purchases: [
      { date: '2022-03-20', quantity: 5, price: 2500 },
      { date: '2022-09-05', quantity: 3, price: 2400 },
    ],
    sells: [
      { date: '2022-03-22', quantity: 5, price: 2520 },
    ],
    currentPrice: 2700,
  },
  // Ajoutez d'autres positions si nécessaire
];

// Add mock historical data for stocks
const stockHistoricalData: { [key: string]: StockHistoricalData[] } = {
  AAPL: [
    { date: '2022-01-01', price: 140 },
    { date: '2022-04-01', price: 155 },
    { date: '2022-07-01', price: 145 },
    { date: '2022-10-01', price: 160 },
    { date: '2023-01-01', price: 170 },
    { date: '2023-04-01', price: 175 },
  ],
  GOOGL: [
    { date: '2022-01-01', price: 2400 },
    { date: '2022-04-01', price: 2500 },
    { date: '2022-07-01', price: 2300 },
    { date: '2022-10-01', price: 2600 },
    { date: '2023-01-01', price: 2650 },
    { date: '2023-04-01', price: 2700 },
  ],
};

const Stack = createStackNavigator();

const StockDetail = ({ route }) => {
  const { position } = route.params;
  const historicalData = stockHistoricalData[position.symbol] || [];

  const allDataPoints = [
    ...historicalData.map(point => ({ ...point, type: 'price' })),
    ...position.purchases.map(purchase => ({ date: purchase.date, price: purchase.price, type: 'purchase' })),
    ...position.sells.map(sell => ({ date: sell.date, price: sell.price, type: 'sell' }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ScrollView contentContainerStyle={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{position.name} ({position.symbol})</Text>
      </View>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={20}
        scale={{ x: "time" }}
      >
        <VictoryLine
          data={allDataPoints}
          x="date"
          y="price"
          style={{
            data: { stroke: "#c43a31" },
          }}
        />
        <VictoryScatter
          data={allDataPoints}
          x="date"
          y="price"
          size={5}
          style={{
            data: {
              fill: ({ datum }) => {
                switch (datum.type) {
                  case 'purchase': return "green";
                  case 'sell': return "red";
                  default: return "transparent";
                }
              }
            }
          }}
        />
        <VictoryAxis
          tickFormat={(date) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getFullYear().toString().substr(-2)}`;
          }}
          style={{
            tickLabels: { fontSize: 10, padding: 5, angle: -45, textAnchor: 'end' }
          }}
        />
        <VictoryAxis dependentAxis
          tickFormat={(t) => `${t}€`}
          style={{
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
      </VictoryChart>
      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>
          <View style={[styles.legendDot, { backgroundColor: "#c43a31" }]} /> Stock Price
        </Text>
        <Text style={styles.legendText}>
          <View style={[styles.legendDot, { backgroundColor: "green" }]} /> Purchase Points
        </Text>
        <Text style={styles.legendText}>
          <View style={[styles.legendDot, { backgroundColor: "red" }]} /> Sell Points
        </Text>
      </View>
      <View style={styles.transactionList}>
        <Text style={styles.transactionTitle}>Purchases:</Text>
        {position.purchases.map((purchase, index) => (
          <Text key={`purchase-${index}`} style={styles.transactionItem}>
            {purchase.date}: {purchase.quantity} shares at {purchase.price}€
          </Text>
        ))}
        <Text style={styles.transactionTitle}>Sells:</Text>
        {position.sells.map((sell, index) => (
          <Text key={`sell-${index}`} style={styles.transactionItem}>
            {sell.date}: {sell.quantity} shares at {sell.price}€
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const StockPositionItem = ({ position }) => {
  const navigation = useNavigation();
  const totalQuantity = position.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const averagePurchasePrice = position.purchases.reduce((sum, purchase) => sum + purchase.price * purchase.quantity, 0) / totalQuantity;
  const totalInvestment = averagePurchasePrice * totalQuantity;
  const currentValue = position.currentPrice * totalQuantity;
  const performancePercentage = ((currentValue - totalInvestment) / totalInvestment) * 100;

  return (
    <Pressable onPress={() => navigation.navigate('StockDetail', { position })} style={styles.stockPositionItem}>
      <Text style={styles.stockSymbol}>{position.symbol}</Text>
      <Text style={styles.stockName}>{position.name}</Text>
      <Text style={styles.stockDetails}>Quantité totale: {totalQuantity}</Text>
      <Text style={styles.stockDetails}>Prix moyen d'achat: {averagePurchasePrice.toFixed(2)} €</Text>
      <Text style={styles.stockDetails}>Prix actuel: {position.currentPrice.toFixed(2)} €</Text>
      <Text style={[styles.stockPerformance, performancePercentage >= 0 ? styles.positivePerformance : styles.negativePerformance]}>
        Performance: {performancePercentage.toFixed(2)}%
      </Text>
      <Text style={styles.stockValue}>Valeur actuelle: {currentValue.toFixed(2)} €</Text>
    </Pressable>
  );
};

const InvestmentOverview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const totalValue = investmentAssets.reduce((sum, asset) => sum + asset.value, 0);
  const overallPerformance = investmentAssets.reduce((sum, asset) => sum + (asset.performance * asset.allocation / 100), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Investissements</Text>
        <Text style={styles.totalValue}>{totalValue.toLocaleString()} €</Text>
        <Text style={styles.performanceText}>
          Performance globale: {overallPerformance.toFixed(2)}%
        </Text>
      </View>

      {/* <View style={styles.chartContainer}>
        <VictoryPie
          data={investmentAssets}
          x="name"
          y="allocation"
          colorScale={['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']}
          radius={({ datum }) => 100 + datum.allocation}
          innerRadius={70}
          labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
          style={{ labels: { fill: 'white', fontSize: 14, fontWeight: 'bold' } }}
        />
      </View> */}

      <View style={styles.periodSelector}>
        {['1M', '3M', '6M', '1A', 'Max'].map((period) => (
          <Pressable
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === period && styles.selectedPeriodText]}>
              {period}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <VictoryChart theme={VictoryTheme.material}>
          <VictoryLine
            data={historicalPerformance}
            x="date"
            y="value"
            style={{
              data: { stroke: "#c43a31" },
              parent: { border: "1px solid #ccc" }
            }}
          />
          <VictoryAxis
            tickFormat={(t) => t.split('-')[1]}
            style={{
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
          <VictoryAxis dependentAxis
            tickFormat={(t) => `${t / 1000}k€`}
            style={{
              tickLabels: { fontSize: 10, padding: 5 }
            }}
          />
        </VictoryChart>
      </View>

      <View style={styles.assetList}>
        <Text style={styles.assetListTitle}>Répartition des actifs</Text>
        {investmentAssets.map((asset, index) => (
          <View key={index} style={styles.assetItem}>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetAllocation}>{asset.allocation}%</Text>
            </View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetValue}>{asset.value.toLocaleString()} €</Text>
              <Text style={[styles.assetPerformance, asset.performance >= 0 ? styles.positivePerformance : styles.negativePerformance]}>
                {asset.performance >= 0 ? '+' : ''}{asset.performance.toFixed(2)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.stockPositionsContainer}>
        <Text style={styles.sectionTitle}>Positions sur actions</Text>
        {stockPositions.map((position, index) => (
          <StockPositionItem
            key={index}
            position={position}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default function InvestmentScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InvestmentOverview"
        component={InvestmentOverview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetail}
        options={({ route }) => ({ title: route.params.position.symbol })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  performanceText: {
    fontSize: 16,
    color: '#888',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  selectedPeriod: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    color: '#4a4a4a',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  assetList: {
    backgroundColor: '#fff',
    padding: 20,
  },
  assetListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  assetInfo: {
    flexDirection: 'column',
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assetAllocation: {
    fontSize: 14,
    color: '#888',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  assetPerformance: {
    fontSize: 14,
    textAlign: 'right',
  },
  positivePerformance: {
    color: '#4CD964',
  },
  negativePerformance: {
    color: '#FF3B30',
  },
  stockPositionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stockPositionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  stockDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  stockPerformance: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  transactionList: {
    marginTop: 20,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transactionItem: {
    fontSize: 14,
    marginBottom: 3,
  },
});