import Calendar from "@/components/calendar";
import type { CalendarMode, CalendarYearMonth } from "@/types/calendar";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const CalendarScreen = () => {
  const normalizedToday = useMemo(
    () => new Date(new Date().toDateString()),
    []
  );

  const [mode, setMode] = useState<CalendarMode>("month");

  const [currentYearMonth, setCurrentYearMonth] = useState<CalendarYearMonth>({
    year: normalizedToday.getFullYear(),
    month: normalizedToday.getMonth(),
  });

  const [selectedDate, setSelectedDate] = useState<Date>(normalizedToday);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (yearMonth: CalendarYearMonth) => {
    setCurrentYearMonth(yearMonth);
  };

  return (
    <View style={styles.container}>
      <Calendar
        currentYearMonth={currentYearMonth}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onMonthChange={handleMonthChange}
        mode={mode}
      />
      <Pressable
        onPress={() => {
          if (mode === "month") {
            setMode("week");
          } else {
            setMode("month");
          }
        }}
        style={{
          marginInline: "auto",
          padding: 12,
          backgroundColor: "#329EFF",
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff" }}>
          {mode === "month" ? "주간 보기" : "월간 보기"}
        </Text>
      </Pressable>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
