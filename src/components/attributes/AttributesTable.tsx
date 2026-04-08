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
      const parent = values.find((item) => item.parent === value.key);

      return (
        <TableRow key={value.key}>
          <TableCell>{value.number}</TableCell>

          {parent ? (
            <>
              <TableCell>{parent?.translations.hy ?? parent?.translations.am}</TableCell>
              <TableCell>{value.translations.hy ?? value.translations.am}</TableCell>
              <TableCell>{parent?.translations.ru}</TableCell>
              <TableCell>{value.translations.ru}</TableCell>
              <TableCell>{parent?.translations.en}</TableCell>
              <TableCell>{value.translations.en}</TableCell>
            </>
          ) : (
            <>
              <TableCell>{value.translations.hy ?? value.translations.am}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{value.translations.ru}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{value.translations.en}</TableCell>
              <TableCell>-</TableCell>
            </>
          )}
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
