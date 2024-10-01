import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VictoryChart, VictoryAxis, VictoryStack, VictoryBar, VictoryLine, VictoryLegend } from 'victory-native';

// Mock data for budget over months
const budgetOverMonths = [
  { month: 'Jan', Income: 5000, Expenses: 4000 },
  { month: 'Feb', Income: 5200, Expenses: 3800 },
  { month: 'Mar', Income: 5100, Expenses: 4200 },
  { month: 'Apr', Income: 5300, Expenses: 3900 },
  { month: 'May', Income: 5400, Expenses: 4100 },
  { month: 'Jun', Income: 5600, Expenses: 4300 },
];

// Mock data for wealth over time by account
const wealthOverTime = [
  { month: 'Jan', Checking: 2000, Savings: 5000, Investment: 10000 },
  { month: 'Feb', Checking: 2200, Savings: 5200, Investment: 10500 },
  { month: 'Mar', Checking: 2100, Savings: 5400, Investment: 11000 },
  { month: 'Apr', Checking: 2300, Savings: 5600, Investment: 11500 },
  { month: 'May', Checking: 2400, Savings: 5800, Investment: 12000 },
  { month: 'Jun', Checking: 2600, Savings: 6000, Investment: 12500 },
];

export default function WealthDashboard() {
  const totalWealth = wealthOverTime[wealthOverTime.length - 1].Checking +
                      wealthOverTime[wealthOverTime.length - 1].Savings +
                      wealthOverTime[wealthOverTime.length - 1].Investment;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wealth Dashboard</Text>
      
      <View style={styles.totalWealthContainer}>
        <Text style={styles.totalWealthLabel}>Total Wealth</Text>
        <Text style={styles.totalWealthValue}>{totalWealth.toLocaleString()} €</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Budget Over Months</Text>
        <VictoryChart height={300} padding={{ top: 20, bottom: 40, left: 60, right: 40 }}>
          <VictoryAxis
            tickValues={budgetOverMonths.map(d => d.month)}
            style={{ tickLabels: { fontSize: 12, padding: 5 } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t / 1000}k€`}
            style={{ tickLabels: { fontSize: 12, padding: 5 } }}
          />
          <VictoryLine
            data={budgetOverMonths}
            x="month"
            y="Income"
            style={{ data: { stroke: "#4CAF50" } }}
          />
          <VictoryLine
            data={budgetOverMonths}
            x="month"
            y="Expenses"
            style={{ data: { stroke: "#F44336" } }}
          />
          <VictoryLegend x={125} y={10}
            orientation="horizontal"
            gutter={20}
            style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
            data={[
              { name: "Income", symbol: { fill: "#4CAF50" } },
              { name: "Expenses", symbol: { fill: "#F44336" } }
            ]}
          />
        </VictoryChart>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Wealth Over Time by Account</Text>
        <VictoryChart height={300} padding={{ top: 20, bottom: 40, left: 60, right: 40 }}>
          <VictoryAxis
            tickValues={wealthOverTime.map(d => d.month)}
            style={{ tickLabels: { fontSize: 12, padding: 5 } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t / 1000}k€`}
            style={{ tickLabels: { fontSize: 12, padding: 5 } }}
          />
          <VictoryStack colorScale={["#FF9800", "#2196F3", "#4CAF50"]}>
            {["Checking", "Savings", "Investment"].map((account, index) => (
              <VictoryBar
                key={index}
                data={wealthOverTime}
                x="month"
                y={account}
              />
            ))}
          </VictoryStack>
          <VictoryLegend x={90} y={10}
            orientation="horizontal"
            gutter={20}
            style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
            data={[
              { name: "Checking", symbol: { fill: "#FF9800" } },
              { name: "Savings", symbol: { fill: "#2196F3" } },
              { name: "Investment", symbol: { fill: "#4CAF50" } }
            ]}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  totalWealthContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalWealthLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalWealthValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});