import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useMemo } from "react";
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

interface DayInfo {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
}

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
  onMonthChange?: (date: Date) => void;
  currentYearMonth: Date;
  selectedDate?: Date;
}

const Calendar = ({
  onSelectDate,
  onMonthChange,
  currentYearMonth,
  selectedDate,
}: CalendarProps) => {
  const getDaysInMonth = useCallback(
    (year: number, month: number): DayInfo[] => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay();
      const endDayOfWeek = lastDay.getDay();

      const days: DayInfo[] = [];

      // 달력 첫째 주에 표기할 이전 월 날짜들 추가
      const prevMonth = new Date(year, month - 1, 1);
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      for (let i = 0; i < startDayOfWeek; i++) {
        const day = prevMonthLastDay - (startDayOfWeek - i) + 1;
        days.push({
          day,
          date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
          isCurrentMonth: false,
        });
      }

      // 현재 월 날짜들 추가
      for (let day = 1; day <= daysInMonth; day++) {
        days.push({
          day,
          date: new Date(year, month, day),
          isCurrentMonth: true,
        });
      }

      // 달력 마지막 주에 표기할 다음 월 날짜들 추가
      const nextMonthDaysNeeded = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
      const nextMonth = new Date(year, month + 1, 1);

      for (let day = 1; day <= nextMonthDaysNeeded; day++) {
        days.push({
          day,
          date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
          isCurrentMonth: false,
        });
      }

      return days;
    },
    []
  );

  const handlePrevMonth = () => {
    const prevMonth = new Date(
      currentYearMonth.getFullYear(),
      currentYearMonth.getMonth() - 1,
      1
    );
    onMonthChange?.(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      currentYearMonth.getFullYear(),
      currentYearMonth.getMonth() + 1,
      1
    );
    onMonthChange?.(nextMonth);
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

  const formatYearMonth = (date: Date): string => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const daysInMonth = getDaysInMonth(
    currentYearMonth.getFullYear(),
    currentYearMonth.getMonth()
  );

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
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.yearMonthText}>
          {formatYearMonth(currentYearMonth)}
        </Text>
        <Pressable style={styles.navButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <CalendarCell key={day} item={day} />
        ))}
      </View>

      <FlatList
        data={daysInMonth}
        renderItem={renderDay}
        keyExtractor={(item, index) => `${item.date.getTime()}-${index}`}
        numColumns={7}
        scrollEnabled={false}
      />
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
});
