import type {
  CalendarMode,
  CalendarYearMonth,
  DayInfo,
} from "@/types/calendar";
import {
  getDaysInMonth,
  getNextYearMonth,
  getPrevYearMonth,
  groupDaysByWeek,
} from "@/utils/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DayType = (typeof DAYS)[number];

const { width: screenWidth } = Dimensions.get("window");
const CELL_MARGIN = 2;
const CONTAINER_PADDING = 32;
const COLUMNS = 7;
const cellWidth =
  (screenWidth - CONTAINER_PADDING - CELL_MARGIN * 2 * COLUMNS) / COLUMNS;

interface CalendarCellProps {
  item: DayType | DayInfo;
  isSelected?: boolean;
  onPress?: () => void;
}

const CalendarCell = ({ item, isSelected, onPress }: CalendarCellProps) => {
  const cellStyle = useMemo(() => {
    if (typeof item === "string") {
      return item === "일"
        ? styles.sundayText
        : item === "토"
        ? styles.saturdayText
        : styles.headerText;
    }

    if (typeof item === "object" && "isCurrentMonth" in item) {
      if (!item.isCurrentMonth) {
        return styles.otherMonthText;
      }
    }

    return styles.dayText;
  }, [item]);

  const cellContainerStyle = useMemo(() => {
    return [styles.cellContainer, isSelected && styles.selectedCellContainer];
  }, [isSelected]);

  const displayText = useMemo(() => {
    if (typeof item === "string") return item;
    return item.day.toString();
  }, [item]);

  return (
    <Pressable
      style={cellContainerStyle}
      onPress={onPress}
      disabled={typeof item === "string"}
    >
      <Text style={cellStyle}>{displayText}</Text>
    </Pressable>
  );
};

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  onMonthChange?: (yearMonth: CalendarYearMonth) => void;
  currentYearMonth: CalendarYearMonth;
  selectedDate?: Date;
  mode?: CalendarMode;
}

const Calendar = ({
  onSelectDate,
  onMonthChange,
  currentYearMonth,
  selectedDate,
  mode = "month",
}: CalendarProps) => {
  const handlePrevMonth = () => {
    const prevYearMonth = getPrevYearMonth(currentYearMonth);
    onMonthChange?.(prevYearMonth);
  };

  const handleNextMonth = () => {
    const nextYearMonth = getNextYearMonth(currentYearMonth);
    onMonthChange?.(nextYearMonth);
  };

  const handleSelectDate = (dayInfo: DayInfo) => {
    onSelectDate(dayInfo.date);
  };

  const isDateSelected = (dayInfo: DayInfo): boolean => {
    if (!selectedDate) return false;

    return (
      selectedDate.getFullYear() === dayInfo.date.getFullYear() &&
      selectedDate.getMonth() === dayInfo.date.getMonth() &&
      selectedDate.getDate() === dayInfo.date.getDate()
    );
  };

  const monthWeeks = useMemo(() => {
    const allDays = getDaysInMonth(
      currentYearMonth.year,
      currentYearMonth.month
    );
    return groupDaysByWeek(allDays);
  }, [currentYearMonth]);

  const renderDay = ({ item }: { item: DayInfo }) => {
    return (
      <CalendarCell
        item={item}
        isSelected={isDateSelected(item)}
        onPress={() => handleSelectDate(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color="#329EFF" />
        </Pressable>
        <Text style={styles.yearMonthText}>
          {`${currentYearMonth.year}년 ${currentYearMonth.month + 1}월`}
        </Text>
        <Pressable style={styles.navButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#329EFF" />
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <CalendarCell key={day} item={day} />
        ))}
      </View>
      {monthWeeks.map((week, index) => (
        <FlatList
          key={index}
          data={week}
          renderItem={renderDay}
          keyExtractor={(item, index) => `${item.date.getTime()}-${index}`}
          numColumns={7}
          scrollEnabled={false}
          style={styles.weekContainer}
        />
      ))}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  yearMonthText: {
    fontSize: 18,
    fontWeight: "600",
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  cellContainer: {
    width: cellWidth,
    aspectRatio: 1 / 1,
    justifyContent: "center",
    alignItems: "center",
    margin: CELL_MARGIN,
  },
  selectedCellContainer: {
    borderColor: "#b7b7b7",
    borderRadius: "100%",
    borderWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sundayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6363",
  },
  saturdayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#329EFF",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  otherMonthText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#999",
  },
  weekContainer: {
    flexGrow: 0,
  },
});
