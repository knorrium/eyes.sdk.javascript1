package com.applitools.eyes.unit;

import com.applitools.eyes.Region;
import com.applitools.eyes.universal.dto.RegionDto;
import com.applitools.eyes.universal.mapper.LocateMapper;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TestLocateMapping {

    @Test
    public void testLocateMapping() {
        Map<String, List<RegionDto>> response = new HashMap<>();
        List<RegionDto> regionsDto = new ArrayList<>();
        RegionDto regionDto1 = new RegionDto();
        regionDto1.setX(10);
        regionDto1.setY(20);
        regionDto1.setWidth(300);
        regionDto1.setHeight(400);

        RegionDto regionDto2 = new RegionDto();
        regionDto2.setX(10);
        regionDto2.setY(20);
        regionDto2.setWidth(300);
        regionDto2.setHeight(400);

        regionsDto.add(regionDto1);
        regionsDto.add(regionDto2);

        response.put("first", regionsDto);

        List<RegionDto> anotherRegionsDto = new ArrayList<>(regionsDto);
        anotherRegionsDto.add(regionDto2);
        response.put("second", anotherRegionsDto);

        Map<String, List<Region>> actualResponse = LocateMapper.toLocateFromDto(response);
        List<Region> actualRegion1 = actualResponse.get("first");
        List<Region> actualRegion2 = actualResponse.get("second");

        Assert.assertEquals(actualRegion1.get(0).getLeft(), (int) regionDto1.getX());
        Assert.assertEquals(actualRegion1.get(0).getTop(), (int) regionDto1.getY());
        Assert.assertEquals(actualRegion1.get(0).getWidth(), (int) regionDto1.getWidth());
        Assert.assertEquals(actualRegion1.get(0).getHeight(), (int) regionDto1.getHeight());

        Assert.assertEquals(actualRegion1.get(1).getLeft(), (int) regionDto2.getX());
        Assert.assertEquals(actualRegion1.get(1).getTop(), (int) regionDto2.getY());
        Assert.assertEquals(actualRegion1.get(1).getWidth(), (int) regionDto2.getWidth());
        Assert.assertEquals(actualRegion1.get(1).getHeight(), (int) regionDto2.getHeight());

        Assert.assertEquals(actualRegion2.get(2).getLeft(), (int) regionDto2.getX());
        Assert.assertEquals(actualRegion2.get(2).getTop(), (int) regionDto2.getY());
        Assert.assertEquals(actualRegion2.get(2).getWidth(), (int) regionDto2.getWidth());
        Assert.assertEquals(actualRegion2.get(2).getHeight(), (int) regionDto2.getHeight());
    }
}
