import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attribute } from "@/types/attribute";

const thClass = "bg-background sticky top-0 z-20";

interface AttributesTableProps {
  attributes: Attribute[];
}

const AttributesTable = ({ attributes }: AttributesTableProps) => {
  const renderItems = (attribute: Attribute) => {
    const { values } = attribute;

    return values.map((value) => {
      return (
        <TableRow key={value._id}>
          <TableCell>{value.number}</TableCell>
          <TableCell>{value.title.hy}</TableCell>
          <TableCell>{value.secondaryTitle?.hy || "-"}</TableCell>
          <TableCell>{value.title.ru}</TableCell>
          <TableCell>{value.secondaryTitle?.ru || "-"}</TableCell>
          <TableCell>{value.title.en}</TableCell>
          <TableCell>{value.secondaryTitle?.en || "-"}</TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-164px)] w-full overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={thClass}>ID</TableHead>
            <TableHead className={thClass}>Հատկանիշի արժեքները (տեսակները)</TableHead>
            <TableHead className={thClass}>
              Հատկանիշի արժեքները (տեսակները)՝ 2-րդ մակարդակի
            </TableHead>
            <TableHead className={thClass}>Значения признака (типы)</TableHead>
            <TableHead className={thClass}>Значения признака (типы) - 2-й уровень</TableHead>
            <TableHead className={thClass}>Attribute values (types) </TableHead>
            <TableHead className={thClass}>Attribute values (types) - 2nd level</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>{attributes.map(renderItems)}</TableBody>
      </Table>
    </div>
  );
};

export default AttributesTable;
