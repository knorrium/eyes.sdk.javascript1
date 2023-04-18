package com.applitools.eyes.universal.mapper;

import com.applitools.eyes.Region;
import com.applitools.eyes.universal.dto.RegionDto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class LocateMapper {

    private static Region toRegionFromRegionDto(RegionDto regionDto) {
        if (regionDto == null) {
            return null;
        }

        Region region = Region.EMPTY;

        if (regionDto.getX() != null && regionDto.getY() != null) {
            region.setX(regionDto.getX());
            region.setY(regionDto.getY());
            region.setWidth(regionDto.getWidth());
            region.setHeight(regionDto.getHeight());
            return region;
        }
        if (regionDto.getLeft() != null && regionDto.getTop() != null) {
            region.setLeft(regionDto.getLeft());
            region.setTop(regionDto.getTop());
            region.setWidth(regionDto.getWidth());
            region.setHeight(regionDto.getHeight());

            return region;
        }

        return null;
    }

    private static List<Region> toRegionListFromDto(List<RegionDto> regionsDto) {
        if (regionsDto == null || regionsDto.isEmpty()) {
            return null;
        }

        return regionsDto.stream().map(LocateMapper::toRegionFromRegionDto).collect(Collectors.toList());
    }

    public static Map<String, List<Region>> toLocateFromDto(Map<String, List<RegionDto>> regions) {
        if (regions == null || regions.isEmpty()) {
            return null;
        }

        Map<String, List<Region>> locateRegions = new HashMap<>();

        for(Map.Entry<String,List<RegionDto>> entry : regions.entrySet()) {
            locateRegions.put(entry.getKey(), toRegionListFromDto(entry.getValue()));
        }

        return locateRegions;
    }
}
